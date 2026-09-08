# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root via Turborepo unless a package is specified with `--filter`.

```bash
pnpm install                          # install all workspace deps
pnpm dev                              # run all apps in dev/watch mode (turbo run dev, persistent)
pnpm build                            # build all packages (respects dependency graph: api before web)
pnpm lint                             # eslint across all packages
pnpm type                             # tsc --noEmit across all packages
pnpm test                             # vitest run across all packages

pnpm --filter @repo/api dev           # API only, on :3001, watch mode
pnpm --filter @repo/web dev           # web only, on :3000
pnpm --filter @repo/api exec vitest run path/to/file.test.ts    # single test file (api)
pnpm --filter @repo/web exec vitest run path/to/file.test.tsx   # single test file (web)
pnpm --filter @repo/api exec prisma generate  # regenerate prisma/generated (needed on a fresh clone before anything else works — see prisma/README.md)
pnpm --filter @repo/api db:migrate    # prisma migrate dev (also runs db:seed automatically)
pnpm --filter @repo/api db:seed       # prisma db seed — populates a default user + sample todos
pnpm --filter @repo/api db:studio     # prisma studio
pnpm --filter @repo/api trpc:generate # regenerate the tRPC AppRouter type (see below)
```

`turbo.json` wires `build`/`lint`/`type`/`test` to `dependsOn: ["^build"]`, so `apps/api#build` always runs before `apps/web#build` — this matters because `apps/web` needs `apps/api`'s generated tRPC router types to exist first (see below). `apps/api#build`'s `outputs` deliberately includes `src/router/generated/**` (not just `dist/**`) so a turbo cache hit still restores that file — without it, a cache hit on `apps/api#build` would silently skip regenerating the router types `apps/web` depends on, only ever surfacing once remote caching is added (invisible today since CI never has a pre-existing local cache).

CI (`.github/workflows/ci.yml`) runs install → `prisma generate` → lint → type → test → build on push to `main` and on every PR. A pre-commit hook (husky, `.husky/pre-commit`) runs `lint-staged` (`eslint --fix` + `prettier --write` on staged files) locally.

## Architecture

Monorepo: pnpm workspaces (`apps/*`, `packages/*`) + Turborepo. Packages use the `@repo/*` scope with `workspace:*` versions.

- `apps/api` — NestJS backend, dual REST + tRPC API, Prisma/SQLite.
- `apps/web` — Next.js 16 (App Router) frontend, consumes the API exclusively via a tRPC client.
- `packages/types` — shared Zod schemas (`Todo`, `User`, `CreateTodoSchema`, `UpdateTodoSchema`, `StatusSchema`, `PrioritySchema`, etc.), consumed by both apps and reused as tRPC input/output validators. **Ships as raw `.ts` source with no build step** — its `package.json` `exports` point directly at `./src/index.ts`. This is why `apps/api` cannot use a plain `tsc`-compile-then-`node` execution model (see "How apps/api actually runs" below).

### `apps/api`: NestJS hosting both REST and tRPC on the same server

The API is not a REST-only or tRPC-only service — it's both, on the same Express instance under NestJS:

- **REST** (`src/todo/todo.controller.ts`) — conventional Nest controllers/DTOs (`class-validator`), documented via `@nestjs/swagger` at `/api/docs`.
- **tRPC** (`src/trpc/todo.router.ts`) — via `nestjs-trpc`, using `@Router()`/`@Query()`/`@Mutation()`/`@Input()` decorators. Router classes are ordinary Nest providers (constructor-injectable), registered in `todo.module.ts`.
- Both the REST controller and the tRPC router **delegate to the same `TodoService`** — Prisma query logic lives in exactly one place.
- `src/common/` holds cross-cutting REST concerns: `ApiKeyGuard` (checked via `x-api-key`, applied to REST mutations), `LoggerMiddleware` (global, but only actually logs REST traffic — `nestjs-trpc` mounts its own Express handler that bypasses Nest's middleware layer, which is also why the global `@nestjs/throttler` rate limit only covers REST), `TransformInterceptor` (wraps REST responses as `{success, data, timestamp}`; does **not** affect tRPC responses, which keep the raw tRPC wire shape `{"result":{"data":...}}` that `apps/web`'s `httpBatchLink` expects), and `AllExceptionsFilter` (global, maps known Prisma error codes to a proper status + sanitized message instead of a raw leaked message). tRPC mutations are guarded too, via an equivalent `nestjs-trpc` middleware (`src/trpc/api-key.middleware.ts`, applied per-procedure with `@UseMiddlewares`) — since `apps/web` is entirely client-rendered, it can't hold that key itself without exposing it in the browser, so it proxies every tRPC call through its own `app/api/trpc/[...trpc]/route.ts`, which attaches `x-api-key` server-side. tRPC error normalization is separate (`src/trpc/trpc-error.util.ts`'s `callTodoProcedure`, wrapping every procedure) since `AllExceptionsFilter` only catches REST — see `apps/api/README.md#error-handling` for the full breakdown of both.
- `TodoService.findAll` is paginated (`take`/`skip`, default 50, max 100) with matching Prisma indexes on `authorId`/`status`. `apps/web` doesn't page through this yet — it fetches the default window and still filters/sorts client-side.

### The `AppRouter` type contract with `apps/web`

`apps/web` imports `import type { AppRouter } from "@repo/api/router"`, resolved via `apps/api/package.json`'s `"./router"` subpath export to `src/router/index.ts`. That file is hand-written and committed:

```ts
export type { AppRouter } from "./generated/server.js";
```

`src/router/generated/server.ts` is produced by the `nestjs-trpc generate` CLI (a separate Rust binary, not part of `TRPCModuleOptions`) — it's gitignored and regenerated on every `build`. It statically parses `TRPCModule.forRoot(...)`, which must be reachable directly from `app.module.ts` (inlined in `AppModule`'s `imports`, not wrapped in a sub-module — the generator's static analysis doesn't traverse into imported modules). The generated file only carries _types_; procedure bodies are placeholders. The real runtime router is built via live reflection over the `@Router()`-decorated classes at Nest bootstrap.

If you add a new tRPC router, give it an explicit `@Router({ alias: "..." })` — without it, the top-level procedure-tree key defaults to the class name (e.g. `TodoRouter` → `todoRouter`, not `todo`), which would silently break `apps/web`'s `trpc.todo.*` calls.

### How `apps/api` actually runs (not the standard Nest CLI pipeline)

`dev`/`start` run `node --import @swc-node/register/esm-register src/main.ts` directly — **not** `nest start`/`nest build` + `node dist/main.js`. Two reasons, both load-bearing:

1. `packages/types` has no build step (see above), so plain `node` can never resolve its raw `.ts` source at runtime. `@swc-node/register` is a loader hook that transpiles any `.ts` file it encounters on demand, including linked workspace packages — this is required, not a style choice.
2. `tsx`/esbuild do not reliably emit `emitDecoratorMetadata` for constructor parameters, which breaks NestJS's DI **silently** (services get injected as `undefined`, no crash at boot). SWC has correct support for this, which is why `@swc-node/register` is used instead of `tsx`.

`apps/api/tsconfig.json` deliberately keeps `module: "ESNext"` / `moduleResolution: "Bundler"` (not `NodeNext`) — `packages/types`'s internal relative imports lack `.js` extensions, which `NodeNext` resolution rejects.

`nest build` (chained with `nestjs-trpc generate` in the `build` script) still runs, but only as a type-check + router-codegen gate for `apps/web`'s build — its `dist/` output is never executed.

### Prisma

`prisma/schema.prisma` (SQLite) uses the `prisma-client` generator with typed output to `apps/api/prisma/generated` (raw TS, gitignored, regenerated by `prisma generate`) — colocated under `prisma/` rather than at the app root, mirroring how `nestjs-trpc`'s codegen lives under `src/router/generated/` next to the router it concerns. `PrismaService` (`src/prisma/prisma.service.ts`) extends `PrismaClient` using the `@prisma/adapter-better-sqlite3` driver adapter, resolving `dev.db`'s path relative to `import.meta.dirname`. `prisma.config.ts` (not `schema.prisma`'s `datasource.url`) is the source of truth for the DB file path used by the Prisma CLI.

No field uses Prisma's `@map(...)` (only the table-level `@@map`, e.g. `Todo` → `todos`) — this is deliberate, not an oversight: verified via query logging that the installed `prisma-client` generator (Prisma 7.8.0) silently ignores field-level `@map` when building queries against the `better-sqlite3` adapter, while `prisma migrate dev`'s diff engine _does_ honor it — combining the two would make `migrate dev` think columns need renaming that the runtime client would never actually query correctly. See `apps/api/prisma/README.md` for the full writeup.

### `apps/web`: Server Components for reads, a same-origin proxy for writes

Two distinct ways this app talks to `apps/api`, chosen per route based on whether the code runs on the server or in the browser:

- **Server Components** (`page.tsx` the todo list, and `todos/[id]/page.tsx` the detail page) call `apps/api` directly over HTTP via `src/lib/trpc/server.ts` — a vanilla tRPC client wrapped in `createTRPCOptionsProxy`, guarded by `import "server-only"` so it can't accidentally end up in a client bundle. It attaches `x-api-key` from the server-only `API_KEY` env var. Each page creates a per-request `QueryClient`, `prefetchQuery`s into it, and passes `dehydrate(queryClient)` to `<HydrationBoundary>` wrapping a Client Component (`TodoList` / `TodoDetail`) — the client-side `useQuery(trpc.todo.*.queryOptions())` in that component picks up the exact same cache entry on hydration, because `createTRPCOptionsProxy` and the `useTRPC()` hook generate identical query keys from the same procedure path + input, regardless of which client instance produced them. `todos/[id]/page.tsx` also uses this to implement `generateMetadata` (page title = todo title), which a `"use client"` page cannot export. Both list and detail pages are marked `export const dynamic = "force-dynamic"` — without it Next.js would statically prerender them once at build time and serve that frozen snapshot to every visitor, since neither reads request-time input like cookies/searchParams that would otherwise signal "don't cache this."
- **Client Components** (all mutations, plus the fully client-rendered new/edit forms) go through `app/api/trpc/[...trpc]/route.ts`, a same-origin proxy that forwards every tRPC call to `apps/api` and attaches `x-api-key` server-side — the browser never sees the key. See `apps/web/README.md` for the full request-flow diagram and why this split exists.

Shared logic is deliberately pulled out of components so it can be unit-tested without rendering anything: `src/lib/filter-sort-todos.ts` (list search/filter/sort, a pure function) and `src/lib/hooks/optimistic-todo-list-cache.ts` (the optimistic-update snapshot/apply/rollback used by `useOptimisticTodoListMutation`, tested against a plain `QueryClient` with no tRPC involved).

### Testing

All three packages use Vitest (`pnpm test` / per-package `vitest.config.ts`):

- `packages/types` — plain Node environment; Zod schema validation tests.
- `apps/api` — plain Node environment (`vitest.config.ts`). Tests instantiate classes directly (`new TodoService(fakePrisma)`) rather than going through `Test.createTestingModule()` — this sidesteps NestJS DI/decorator-metadata concerns entirely (see "How `apps/api` actually runs" above) since no reflection-based injection happens. Prisma errors in tests are real `Prisma.PrismaClientKnownRequestError` instances (`new Prisma.PrismaClientKnownRequestError(message, { code, clientVersion })`), not duck-typed fakes.
- `apps/web` — `happy-dom` environment, `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` for component tests (`vitest.setup.ts` explicitly calls `afterEach(cleanup)` since `test.globals` is off). `apps/web/tsconfig.json` includes `vitest.config.ts`/`vitest.setup.ts` so `tsc` (not just Vitest) picks up jest-dom's type augmentations.
