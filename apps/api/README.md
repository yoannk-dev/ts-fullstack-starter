# @repo/api

HTTP server exposing a type-safe API — both REST and tRPC — backed by a SQLite database.

## Stack

**[NestJS](https://nestjs.com/)** — Application framework providing modules, dependency injection, guards, interceptors, and middleware. Runs on the `@nestjs/platform-express` HTTP adapter. REST controllers and the tRPC layer both live inside the same Nest DI container and share the same services.

**[nestjs-trpc](https://nestjs-trpc.io/)** — Integrates tRPC into NestJS with native decorators (`@Router`, `@Query`, `@Mutation`, `@Input`). tRPC router classes are ordinary Nest providers — they can constructor-inject `PrismaService`/`TodoService` like any other class. The tRPC handler is auto-mounted on `/trpc` on the same Express instance NestJS uses for REST.

**[tRPC](https://trpc.io/)** — End-to-end TypeScript procedures for `apps/web`. The shared `AppRouter` type (exported from `src/router/index.ts`, re-exporting a generated type file) is the contract between client and server — zero runtime code generation involved.

**[Prisma](https://www.prisma.io/)** — ORM used to model the database schema and interact with SQLite. The schema (`prisma/schema.prisma`) is the single source of truth: it drives both the migrations and the generated TypeScript client. See [`prisma/README.md`](./prisma/README.md) for migration and seeding workflows.

**[Zod](https://zod.dev/)** — Runtime validation for tRPC procedure inputs/outputs. Schemas are shared across the monorepo via `@repo/types`, so the frontend and backend validate against the same rules.

**[class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer)** — Validate and transform the DTOs used by the REST controllers (`@IsString`, `@IsEnum`, etc.), enforced globally via a `ValidationPipe` in `main.ts`.

**[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** — Generates OpenAPI docs for the REST endpoints, served at `/api/docs`. Protected routes are documented with `@ApiSecurity('x-api-key')`.

## Why both REST and tRPC?

This is a deliberate demonstration of two exposure patterns side by side, not accidental duplication:

- **tRPC** is the *internal* API — the only thing `apps/web` talks to. Type-safety comes from importing `AppRouter` directly; there's no Swagger doc for it.
- **REST** is modeled as the *external/third-party* surface — untrusted callers without a TypeScript client, hence the Swagger docs at `/api/docs`.

Both delegate to the same `TodoService` so business logic isn't duplicated, only the transport/validation/doc layer differs.

Earlier revisions of this README argued that tRPC mutations didn't need a guard because tRPC is "a trusted, first-party client." That argument doesn't hold: CORS only constrains browser-based cross-origin `fetch`/XHR calls, it does nothing to stop a direct `curl`/script hitting `/trpc` on the network. So tRPC mutations (`create`/`update`/`delete`) are now guarded the same way REST mutations are — see Security below.

## Security

- **`x-api-key` on every mutation, REST and tRPC.** REST uses `ApiKeyGuard` (`common/guards/api-key.guard.ts`); tRPC mutations use an equivalent `nestjs-trpc` middleware, `TrpcApiKeyMiddleware` (`src/trpc/api-key.middleware.ts`), applied per-procedure via `@UseMiddlewares(...)`. Queries (`findAll`/`findById`) stay unguarded on both transports — read access is intentionally open.
- **`apps/web` never sees the key.** Since `apps/web` is entirely client-rendered, the browser would otherwise have to carry the API key itself to call guarded tRPC mutations — which means shipping a "secret" in client JS, visible to anyone via devtools. Instead, `apps/web`'s `app/api/trpc/[...trpc]/route.ts` proxies every tRPC call server-side and attaches `x-api-key` there, from a non-`NEXT_PUBLIC_` env var. The browser only ever talks to its own same-origin `/api/trpc`.
- **CORS is restricted** to `WEB_ORIGIN` (`main.ts`), not the previous open wildcard.
- **`helmet()`** sets standard security headers on every response.
- **Global rate limiting** via `@nestjs/throttler` (100 req/min per client) — applied through Nest's `APP_GUARD`, which only covers REST. `nestjs-trpc` mounts its own Express handler bypassing Nest's normal request pipeline (same reason `LoggerMiddleware` never logs tRPC traffic — see Architecture below), so tRPC currently has no rate limiting of its own.
- **Env validation at boot** (`src/env.validation.ts`, Zod) — the app now refuses to start if `API_KEY` is missing, instead of silently booting into a state where the guard "fails closed" by accident.

## Error handling

Both transports normalize errors instead of leaking Prisma's raw messages/stack traces to clients:

- **REST**: `AllExceptionsFilter` (`common/filters/all-exceptions.filter.ts`), registered globally in `main.ts`, passes through `HttpException`s as-is, maps known Prisma error codes (`common/prisma-error.util.ts` — e.g. `P2025` → 404, `P2003` → 400) to a proper status + sanitized message, and falls back to a generic 500 (logging the real error server-side) for anything else.
- **tRPC**: `callTodoProcedure` (`src/trpc/trpc-error.util.ts`) wraps every procedure and performs the same translation, mapped to the equivalent `TRPCError` code. `TodoService` still throws `NotFoundException` explicitly for the "row doesn't exist" case (a business-meaningful 404 with a specific message); this layer is the safety net for everything else (e.g. an invalid `authorId` on `create` — previously an unhandled 500 leaking the Prisma error message verbatim over tRPC).

## Known limitations

- **`authorId` isn't verified.** There's no session/auth concept in this starter — any caller holding the shared `x-api-key` can create a todo under any `authorId`, including one that doesn't belong to them (see the comment on `CreateTodoDto.authorId`). Fixing this needs real per-user authentication (sessions or JWTs) plus a `User` create/list surface, which doesn't exist yet either — deliberately out of scope for a starter template, not an oversight.

## Architecture

REST and tRPC are two parallel entry points into the same application — they share `TodoService` (which owns all Prisma queries) rather than duplicating query logic:

```
Frontend (apps/web)
       │
       │  tRPC client (AppRouter type)
       ▼
┌───────────────────────────────────────────────┐
│                   NestJS                       │
│  ┌───────────────┐        ┌──────────────────┐ │
│  │ TodoController │        │    TodoRouter     │ │
│  │  (REST, DTOs,  │        │ (tRPC, Zod via    │ │
│  │  class-        │        │  @repo/types,     │ │
│  │  validator)    │        │  nestjs-trpc)      │ │
│  └───────┬────────┘        └─────────┬─────────┘ │
│          └──────────┬───────────────┘            │
│                 ┌────▼─────┐                      │
│                 │TodoService│                      │
│                 └────┬─────┘                      │
│  ApiKeyGuard (REST mutations) / TrpcApiKeyMiddleware│
│  (tRPC mutations), LoggerMiddleware (REST only),   │
│  TransformInterceptor (wraps REST responses only)  │
└──────────────────────┬──────────────────────────┘
                        ▼
              ┌───────────────────┐
              │      Prisma        │  ORM + migrations
              │     SQLite DB       │  prisma/dev.db
              └───────────────────┘
```

REST: `GET/POST /todos`, `GET/PATCH/DELETE /todos/:id` (`findAll` accepts `?search=&status=&take=&skip=`), docs at `/api/docs`.
tRPC: `todo.findAll`, `todo.findById`, `todo.create`, `todo.update`, `todo.delete`, mounted at `/trpc`.

`findAll` is paginated (`take`/`skip`, default `take=50`, max `100`, enforced in `TodoService.findAll`) with matching indexes on `authorId` and `status` (migration `add_todo_indexes`). `apps/web` doesn't yet page through this — it fetches the default window and still filters/sorts client-side; wiring the list UI to page controls would mean moving that filtering server-side too, which is a separate piece of work.

## Running

`apps/api` runs via `node --import @swc-node/register/esm-register src/main.ts` (see `dev`/`start` scripts) rather than the standard `nest build` + `node dist/main.js` pipeline. This is required because `@repo/types` (a workspace dependency, used at runtime for Zod validation) ships as raw TypeScript with no build step, and because SWC (unlike esbuild/`tsx`) correctly emits the decorator metadata NestJS's dependency injection depends on. `nest build` still runs as part of the `build` script, but only as a type-check + tRPC router codegen gate — see the root `CLAUDE.md` for the full explanation.
