# @repo/api

HTTP server exposing a type-safe API — both REST and tRPC — backed by a SQLite database.

## Stack

**[NestJS](https://nestjs.com/)** — Application framework providing modules, dependency injection, guards, interceptors, and middleware. Runs on the `@nestjs/platform-express` HTTP adapter. REST controllers and the tRPC layer both live inside the same Nest DI container and share the same services.

**[nestjs-trpc](https://nestjs-trpc.io/)** — Integrates tRPC into NestJS with native decorators (`@Router`, `@Query`, `@Mutation`, `@Input`). tRPC router classes are ordinary Nest providers — they can constructor-inject `PrismaService`/`PostService` like any other class. The tRPC handler is auto-mounted on `/trpc` on the same Express instance NestJS uses for REST.

**[tRPC](https://trpc.io/)** — End-to-end TypeScript procedures for `apps/web`. The shared `AppRouter` type (exported from `src/router/index.ts`, re-exporting a generated type file) is the contract between client and server — zero runtime code generation involved.

**[Prisma](https://www.prisma.io/)** — ORM used to model the database schema and interact with SQLite. The schema (`prisma/schema.prisma`) is the single source of truth: it drives both the migrations and the generated TypeScript client. See [`prisma/README.md`](./prisma/README.md) for migration workflows.

**[Zod](https://zod.dev/)** — Runtime validation for tRPC procedure inputs/outputs. Schemas are shared across the monorepo via `@repo/types`, so the frontend and backend validate against the same rules.

**[class-validator](https://github.com/typestack/class-validator) / [class-transformer](https://github.com/typestack/class-transformer)** — Validate and transform the DTOs used by the REST controllers (`@IsString`, `@IsUrl`, etc.), enforced globally via a `ValidationPipe` in `main.ts`.

**[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)** — Generates OpenAPI docs for the REST endpoints, served at `/api/docs`. Protected routes are documented with `@ApiSecurity('x-api-key')`.

## Architecture

REST and tRPC are two parallel entry points into the same application — they share `PostService` (which owns all Prisma queries) rather than duplicating query logic:

```
Frontend (apps/web)
       │
       │  tRPC client (AppRouter type)
       ▼
┌───────────────────────────────────────────────┐
│                   NestJS                       │
│  ┌───────────────┐        ┌──────────────────┐ │
│  │ PostController │        │    PostRouter     │ │
│  │  (REST, DTOs,  │        │ (tRPC, Zod via    │ │
│  │  class-        │        │  @repo/types,     │ │
│  │  validator)    │        │  nestjs-trpc)      │ │
│  └───────┬────────┘        └─────────┬─────────┘ │
│          └──────────┬───────────────┘            │
│                 ┌────▼─────┐                      │
│                 │PostService│                      │
│                 └────┬─────┘                      │
│  common/: ApiKeyGuard (REST mutations),           │
│  LoggerMiddleware (REST only), TransformInterceptor│
│  (wraps REST responses; tRPC responses untouched)  │
└──────────────────────┬──────────────────────────┘
                        ▼
              ┌───────────────────┐
              │      Prisma        │  ORM + migrations
              │     SQLite DB       │  prisma/dev.db
              └───────────────────┘
```

REST: `GET/POST /posts`, `GET/PATCH/DELETE /posts/:id`, docs at `/api/docs`.
tRPC: `post.findAll`, `post.findById`, `post.create`, `post.update`, `post.delete`, mounted at `/trpc`.

## Running

`apps/api` runs via `node --import @swc-node/register/esm-register src/main.ts` (see `dev`/`start` scripts) rather than the standard `nest build` + `node dist/main.js` pipeline. This is required because `@repo/types` (a workspace dependency, used at runtime for Zod validation) ships as raw TypeScript with no build step, and because SWC (unlike esbuild/`tsx`) correctly emits the decorator metadata NestJS's dependency injection depends on. `nest build` still runs as part of the `build` script, but only as a type-check + tRPC router codegen gate — see the root `CLAUDE.md` for the full explanation.
