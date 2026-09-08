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
┌────────────────────────────────────────────────────┐
│                      Next.js                        │
│                                                      │
│  page.tsx, todos/[id]/page.tsx (Server Components)   │
│  lib/trpc/server.ts — server-side tRPC caller        │
│       │ direct HTTP + x-api-key (server-only env)    │
│       ▼                                              │
│     apps/api :3001  ───────────────────────────┐     │
│       ▲                                        │     │
│       │ prefetchQuery() result dehydrated into  │     │
│       │ <HydrationBoundary>, hydrated client-side│     │
│       │                                          │     │
│  Browser (Client Components: TodoList, TodoDetail,  │  │
│  edit/new forms)                                     │  │
│  ┌──────────────────────┐                        │  │
│  │    TanStack Query    │  Server state & caching  │  │
│  │  ┌────────────────┐  │                          │  │
│  │  │   tRPC client  │  │  Type-safe API calls      │  │
│  │  └───────┬────────┘  │  (AppRouter)              │  │
│  └──────────┼───────────┘                        │  │
│             │ same-origin fetch                   │  │
│             ▼                                      │  │
│  app/api/trpc/[...trpc]/route.ts ───────────────────┘  │
│  (Node, never runs in the browser) — attaches x-api-key │
└──────────────────────────────────────────────────────┘
```

### Two ways this app talks to `apps/api`, and why both exist

- **Server Components** (`page.tsx`, the todo list; `todos/[id]/page.tsx`, the detail page) call `apps/api` **directly** over HTTP via `lib/trpc/server.ts` — a vanilla tRPC client (`createTRPCOptionsProxy`) that attaches `x-api-key` from the server-only `API_KEY` env var. This code has `import "server-only"` at the top, so it fails the build if anything ever imports it from a Client Component. The result is `prefetchQuery`'d into a per-request `QueryClient`, then `dehydrate()`d and passed to `<HydrationBoundary>` — the client-side `useQuery(trpc.todo.findAll.queryOptions())`/`useQuery(trpc.todo.findById.queryOptions())` in `TodoList`/`TodoDetail` picks up that exact same cache entry on hydration (same query key, generated the same way on both sides), so both pages render with real data in the initial HTML instead of a loading skeleton, with no separate client-side fetch on first paint. `todos/[id]/page.tsx` also uses a direct `queryClient.fetchQuery` call (deduped by Next's request-scoped `fetch` cache against the identical prefetch below it) inside `generateMetadata`, so the page `<title>` is the todo's own title rather than a static string — something a `"use client"` page can't do at all.
- **Client Components** (`TodoList`'s mutations, and the detail/edit/new pages, which remain fully client-rendered) go through the `app/api/trpc/[...trpc]/route.ts` proxy described below — they can't hold `API_KEY` themselves.

`page.tsx` is marked `export const dynamic = "force-dynamic"` — without it, Next.js would prerender the list once at build time and serve that frozen snapshot to every visitor, since nothing here uses request-time input like cookies or search params to otherwise signal "don't cache this."

### Why a proxy route instead of calling the API directly (Client Components)

`apps/api`'s mutations require `x-api-key` (see `apps/api/README.md#security`) — if the browser called `apps/api` directly, that key would have to be embedded in client JS via `NEXT_PUBLIC_*`, which means anyone could read it from devtools. `app/api/trpc/[...trpc]/route.ts` runs only on the Next.js server: it forwards every tRPC request from Client Components to `apps/api` and attaches the key from `API_KEY`. The browser only ever talks to its own origin (`/api/trpc`).

`.env`/`.env.example` accordingly define `API_URL` (where the real API lives) and `API_KEY` (shared with `apps/api`'s own `.env`) — not `NEXT_PUBLIC_API_URL`, which this replaces.
