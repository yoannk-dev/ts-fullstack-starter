# @repo/web

The frontend: a Next.js app that talks to `apps/api` through tRPC.

## Stack

- **Next.js** — routing, rendering, the App Router under `src/app/`.
- **tRPC** — the API client. Types come straight from `@repo/api`, so there's no separate API schema to keep in sync.
- **TanStack Query** — caching and loading/error state for every tRPC call.
- **Zod** (via `@repo/types`) — the same validation schemas used by the API, reused here for form validation.

## How it talks to the API

**Server Components** (`app/page.tsx`, `app/todos/[id]/page.tsx`) call `apps/api` directly, using the client in `src/api/trpc/server.ts`. This runs on the server, so it can read `API_KEY` from the environment and attach it to requests. Each page prefetches its data and hands it to the client component via `<HydrationBoundary>`, so the page renders with real data already in the HTML instead of a loading spinner.

**Client Components** can't hold `API_KEY`. So instead they call `/api/trpc/...`, a small proxy route (`src/app/api/trpc/[...trpc]/route.ts` → `src/api/trpc/proxy.ts`) that runs on the Next.js server, forwards the request to `apps/api`, and attaches the key there. The browser never sees it.

## Folder layout

- `src/app/` — routes and pages.
- `src/components/` — UI components, mostly under `components/todos/`.
- `src/hooks/` — React hooks
- `src/services/` — plain functions with no React in them (filtering/sorting, cache helpers)
- `src/api/trpc/` — the tRPC client setup described above.
- `src/routing/` — route paths in one place instead of scattered strings.
