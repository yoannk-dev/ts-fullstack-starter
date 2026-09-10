# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Commands

Run from the repo root via Turborepo unless `--filter` targets a package.

```bash
pnpm install                          # install all workspace deps
pnpm dev                              # run all apps in watch mode
pnpm build                            # build all packages (api before web)
pnpm lint / pnpm type / pnpm test     # across all packages

pnpm --filter @repo/api dev           # API only, :3001
pnpm --filter @repo/web dev           # web only, :3000
pnpm --filter @repo/api exec vitest run path/to/file.test.ts
pnpm --filter @repo/api exec prisma generate  # needed on a fresh clone, see prisma/README.md
pnpm --filter @repo/api db:migrate    # prisma migrate dev — does NOT auto-seed
pnpm --filter @repo/api db:seed       # populates a default user + sample todos
pnpm --filter @repo/api trpc:generate # regenerate the tRPC AppRouter type
```

CI runs install → prisma generate → lint → type → test → build. A pre-commit hook (husky + lint-staged) runs eslint/prettier on staged files.

## Architecture

Monorepo: pnpm workspaces (`apps/*`, `packages/*`) + Turborepo, `@repo/*` scope.

- `apps/api` — NestJS, dual REST + tRPC, Prisma/SQLite.
- `apps/web` — Next.js 16 (App Router), talks to the API only via tRPC.
- `packages/types` — shared Zod schemas, used as tRPC validators. **No build step** — `exports` points at raw `.ts`, so `apps/api` can't run through a normal `tsc`+`node` pipeline (see below).

### apps/api: REST + tRPC on one server

- `TodoController` (REST) and `TodoRouter` (tRPC, `nestjs-trpc`) both delegate to `TodoService` — query logic lives in one place.
- Both transports are guarded by `x-api-key` on mutations (`ApiKeyGuard` for REST, `TrpcApiKeyMiddleware` for tRPC). Queries are open.
- `nestjs-trpc` mounts its own Express handler that bypasses Nest's middleware layer — so the global `LoggerMiddleware` and the `@nestjs/throttler` rate limit only cover REST, not tRPC.
- `apps/web` is client-rendered and can't hold the API key itself, so it proxies tRPC calls through `app/api/trpc/[...trpc]/route.ts`, which attaches `x-api-key` server-side.
- Error normalization is separate per transport: `AllExceptionsFilter` (REST) vs `callTodoProcedure` (`src/trpc/trpc-error.util.ts`, wraps every tRPC procedure). Both map known Prisma error codes to sane responses instead of leaking raw messages.
- `TodoService.findAll` is paginated (`take`/`skip`, default 50, max 100). `apps/web` doesn't page through this yet — it fetches the default window and filters/sorts client-side.

### AppRouter type contract with apps/web

`apps/web` imports `AppRouter` via `@repo/api/router` → `src/router/index.ts`, which re-exports the gitignored `src/router/generated/server.ts`. That file is produced by the `nestjs-trpc generate` CLI, regenerated on every `build`, and only carries types (no procedure bodies — the real router is built via reflection at Nest bootstrap).

The generator statically parses `TRPCModule.forRoot(...)` and only works if it's inlined directly in `AppModule`'s `imports` (not re-exported from a sub-module). New routers need an explicit `@Router({ alias: "..." })` — without it the key defaults to the class name (`TodoRouter` → `todoRouter` instead of `todo`), silently breaking `apps/web`'s `trpc.todo.*` calls.

### How apps/api runs

`dev`/`start` run `node --import @swc-node/register/esm-register src/main.ts`, not `nest start`/`nest build`. Two reasons:

1. `packages/types` ships raw `.ts` with no build step — plain `node` can't resolve it; `@swc-node/register` transpiles on demand, workspace packages included.
2. `tsx`/esbuild don't reliably emit `emitDecoratorMetadata`, which breaks Nest's DI silently (services injected as `undefined`, no crash). SWC handles this correctly.

`apps/api/tsconfig.json` keeps `moduleResolution: "Bundler"` (not `NodeNext`) because `packages/types`'s relative imports lack `.js` extensions.

`nest build` still runs as part of `build`, but only as a type-check + router-codegen gate — its `dist/` is never executed.

### Prisma

`prisma/schema.prisma` (SQLite) generates a typed client to `apps/api/prisma/generated` (gitignored). `PrismaService` extends `PrismaClient` via the `@prisma/adapter-better-sqlite3` driver adapter. `prisma.config.ts`, not `schema.prisma`'s `datasource.url`, is the source of truth for the DB path used by the CLI.

No field uses `@map(...)` (only table-level `@@map`) — the installed `prisma-client` generator (7.8.0) silently ignores field-level `@map` against the `better-sqlite3` adapter, while `migrate dev`'s diff engine still honors it, so combining the two would desync migrations from what the client actually queries. See `apps/api/prisma/README.md`.

`better-sqlite3` needs its native binding built — it must stay listed in the root `package.json`'s `pnpm.onlyBuiltDependencies`, or a fresh `pnpm install` leaves the API unable to boot.

### apps/web: Server Components for reads, a proxy for writes

Structured by feature: `src/app` (routes), `src/components`, `src/hooks`, `src/services`, `src/api/trpc`, `src/routing`.

- **Server Components** (`src/app/page.tsx`, `src/app/todos/[id]/page.tsx`) call `apps/api` directly via `src/api/trpc/server.ts` (`import "server-only"`), attaching `x-api-key` from the server-only `API_KEY` env var. Each page prefetches into a `QueryClient` and hydrates a Client Component with it — same query keys, so the client picks up the cache on load. Both pages are `export const dynamic = "force-dynamic"` to avoid a frozen build-time snapshot.
- **Client Components** (mutations, new/edit forms) go through `src/app/api/trpc/[...trpc]/route.ts`, which delegates to `src/api/trpc/proxy.ts` to forward requests to `apps/api` and attach `x-api-key` server-side so the browser never sees it.
- Pure logic lives outside components for unit testing: `src/services/todos/filter-sort-todos.ts` (list filter/sort), `src/services/todos/optimistic-todo-list-cache.ts` (optimistic update snapshot/apply/rollback, consumed by the `src/hooks/todos/use-optimistic-todo-list-mutation.ts` hook).

### Testing

Vitest everywhere (`pnpm test`).

- `packages/types` — plain Node, Zod schema tests.
- `apps/api` — plain Node. Tests instantiate classes directly (`new TodoService(fakePrisma)`), skipping `Test.createTestingModule()` and Nest DI entirely. Prisma errors use real `Prisma.PrismaClientKnownRequestError` instances, not fakes.
- `apps/web` — `happy-dom` + Testing Library (`vitest.setup.ts` calls `afterEach(cleanup)` since `test.globals` is off).
