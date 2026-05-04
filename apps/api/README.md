# @repo/api

HTTP server exposing a type-safe API, backed by a SQLite database.

## Stack

**[Express](https://expressjs.com/)** — Minimal HTTP server used as the transport layer. It handles the request lifecycle, CORS, and JSON parsing. tRPC is mounted as a middleware on `/trpc`, keeping the server setup lightweight and explicit.

**[tRPC](https://trpc.io/)** — Replaces a traditional REST or GraphQL API with end-to-end TypeScript procedures. The router defines strongly-typed queries and mutations that are consumed directly by the frontend with zero code generation. The shared `AppRouter` type is the contract between client and server.

**[Prisma](https://www.prisma.io/)** — ORM used to model the database schema and interact with SQLite. The schema (`prisma/schema.prisma`) is the single source of truth: it drives both the migrations and the generated TypeScript client. See [`prisma/README.md`](./prisma/README.md) for migration workflows.

**[Zod](https://zod.dev/)** — Runtime validation library used to define and enforce input schemas for tRPC procedures. Schemas are shared across the monorepo via `@repo/types`, ensuring the frontend and backend validate data against the same rules.

## Architecture

```
Frontend (apps/web)
       │
       │  tRPC client  (AppRouter type)
       ▼
┌─────────────────────────────┐
│           Express           │  HTTP server — CORS, JSON
│  ┌──────────────────────┐   │
│  │        tRPC          │   │  Type-safe procedures
│  │  ┌────────────────┐  │   │
│  │  │   Zod schemas  │  │   │  Input validation (@repo/types)
│  │  └────────────────┘  │   │
│  └──────────────────────┘   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│           Prisma            │  ORM + migrations
│         SQLite DB           │  prisma/dev.db
└─────────────────────────────┘
```
