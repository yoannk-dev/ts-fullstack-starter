# @repo/web

Next.js frontend consuming the tRPC API, with a strongly-typed data layer.

## Stack

**[Next.js](https://nextjs.org/)** — React framework handling routing, SSR/SSG, and bundling. The App Router is used throughout, with layouts and pages colocated under `src/app/`. Turbopack is enabled in development for fast HMR.

**[tRPC](https://trpc.io/)** — Replaces a hand-written API client. The `AppRouter` type is imported directly from `@repo/api` and passed to the tRPC client, giving full end-to-end type inference on every query and mutation without any code generation step.

**[TanStack Query](https://tanstack.com/query)** — Manages server state: caching, background refetching, and loading/error states. The tRPC client is wired into TanStack Query via `@trpc/tanstack-react-query`, so every tRPC call behaves like a standard `useQuery` or `useMutation`.

**[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework (v4). Configured via `postcss.config.mjs` with `@tailwindcss/postcss`. No config file required — Tailwind v4 auto-detects source files.

**[Zod](https://zod.dev/)** — Shared validation schemas from `@repo/types` are reused on the frontend to validate forms before sending requests to the API.

## Architecture

```
┌─────────────────────────────┐
│          Next.js            │  SSR / App Router / Turbopack
│  ┌──────────────────────┐   │
│  │    TanStack Query    │   │  Server state & caching
│  │  ┌────────────────┐  │   │
│  │  │   tRPC client  │  │   │  Type-safe API calls (AppRouter)
│  │  └────────────────┘  │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │   Tailwind CSS v4    │   │  Utility-first styling
│  └──────────────────────┘   │
└────────────┬────────────────┘
             │  HTTP (tRPC batch)
             ▼
       apps/api  :3000
```
