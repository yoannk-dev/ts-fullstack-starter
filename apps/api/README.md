# @repo/api

NestJS backend exposing the same todo API two ways — REST and tRPC — over SQLite/Prisma.

## Stack

- **[NestJS](https://nestjs.com/)** — modules, DI, guards, interceptors, middleware, on `@nestjs/platform-express`.
- **[nestjs-trpc](https://nestjs-trpc.io/)** — tRPC routers as Nest providers (`@Router`/`@Query`/`@Mutation`/`@Input`), mounted at `/trpc` on the same Express instance as REST.
- **[tRPC](https://trpc.io/)** — the `AppRouter` type (`src/router/index.ts`) is the contract with `apps/web`; no codegen at runtime.
- **[Prisma](https://www.prisma.io/)** — schema (`prisma/schema.prisma`) drives both migrations and the generated client. See [`prisma/README.md`](./prisma/README.md).
- **[Zod](https://zod.dev/)** — tRPC input/output validation, via schemas shared from `@repo/types`.
- **class-validator / class-transformer** — DTO validation for REST controllers, enforced globally via `ValidationPipe`.
- **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** — OpenAPI docs for REST at `/api/docs`.

## Why both REST and tRPC?

Two exposure patterns on purpose, not duplication: tRPC is the internal API `apps/web` talks to (typed via `AppRouter`, no docs needed); REST models the external/third-party surface, documented via Swagger. Both call into the same `TodoService`, so business logic lives in one place.

## Security

- `x-api-key` guards every mutation on both transports — `ApiKeyGuard` for REST, `TrpcApiKeyMiddleware` for tRPC (`src/trpc/api-key.middleware.ts`). Queries stay open.
- `apps/web` never holds the key: it's client-rendered, so `app/api/trpc/[...trpc]/route.ts` proxies tRPC calls server-side and attaches `x-api-key` there instead of shipping it to the browser.
- CORS restricted to `WEB_ORIGIN`, `helmet()` on every response.
- Rate limiting via `@nestjs/throttler` (100 req/min) covers REST only — `nestjs-trpc` mounts its own Express handler outside Nest's normal pipeline, so tRPC isn't covered yet.
- Boot-time env validation (`src/env.validation.ts`) refuses to start without `API_KEY`.

## Error handling

Both transports normalize errors instead of leaking Prisma's raw messages:

- **REST** — `AllExceptionsFilter` maps known Prisma codes (`P2025` → 404, `P2003` → 400, ...) to a sanitized response, falls back to a logged 500.
- **tRPC** — `callTodoProcedure` (`src/trpc/trpc-error.util.ts`) does the same mapping to `TRPCError` codes. `TodoService` still throws `NotFoundException` directly for the "row doesn't exist" case.

## Known limitations

- `authorId` isn't verified against any session — there's no auth in this starter, so any caller with the API key can write under an arbitrary `authorId`. Out of scope until real per-user auth exists.

## Architecture

- REST: `GET/POST /todos`, `GET/PATCH/DELETE /todos/:id` (`findAll` takes `?search=&status=&take=&skip=`), docs at `/api/docs`.
- tRPC: `todo.findAll`, `todo.findById`, `todo.create`, `todo.update`, `todo.delete`, mounted at `/trpc`.
- `findAll` is paginated (`take`/`skip`, default 50, max 100) with matching indexes on `authorId`/`status`. `apps/web` doesn't page through this yet — it fetches the default window and filters/sorts client-side.
