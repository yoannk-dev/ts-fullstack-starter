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
┌──────────────────────────────────────┐
│              Next.js                  │  SSR / App Router / Turbopack
│  Browser (Client Components)          │
│  ┌──────────────────────┐             │
│  │    TanStack Query    │             │  Server state & caching
│  │  ┌────────────────┐  │             │
│  │  │   tRPC client  │  │             │  Type-safe API calls (AppRouter)
│  │  └───────┬────────┘  │             │
│  └──────────┼───────────┘             │
│             │ same-origin fetch        │
│             ▼                          │
│  app/api/trpc/[...trpc]/route.ts       │  Server-side proxy —
│  (Node, never runs in the browser)     │  attaches x-api-key
└──────────────────┬─────────────────────┘
                    │  HTTP (tRPC batch) + x-api-key
                    ▼
              apps/api  :3001
```

### Why a proxy route instead of calling the API directly

Every page here is a Client Component, so the tRPC client runs in the browser. `apps/api`'s mutations require `x-api-key` (see `apps/api/README.md#security`) — if the browser called `apps/api` directly, that key would have to be embedded in client JS via `NEXT_PUBLIC_*`, which means anyone could read it from devtools. `app/api/trpc/[...trpc]/route.ts` runs only on the Next.js server: it forwards every tRPC request to `apps/api` and attaches the key from `API_KEY` (a plain, non-`NEXT_PUBLIC_` env var, so it's never bundled into client JS). The browser only ever talks to its own origin (`/api/trpc`).

`.env`/`.env.example` accordingly define `API_URL` (where the real API lives) and `API_KEY` (shared with `apps/api`'s own `.env`) — not `NEXT_PUBLIC_API_URL`, which this replaces.
