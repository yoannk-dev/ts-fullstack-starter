# ts-fullstack-starter

TypeScript monorepo boilerplate with Next.js, NestJS, tRPC, Prisma, Tailwind CSS, Turborepo & pnpm workspaces.

A todo-list app demonstrating a dual REST + tRPC API (`apps/api`) consumed by a Next.js App Router frontend (`apps/web`), sharing Zod schemas (`packages/types`) as the single source of truth for validation on both ends.

## Prerequisites

- Node.js 20+ (pinned in [`.nvmrc`](.nvmrc) — `nvm use` picks it up automatically)
- pnpm 10+ (pinned via the `packageManager` field in [`package.json`](package.json) — `corepack enable` makes this automatic)

## Getting started

```bash
pnpm install                                  # install all workspace deps
pnpm --filter @repo/api exec prisma generate  # generate the Prisma client (needed before anything else works)
pnpm --filter @repo/api db:migrate            # apply migrations to a local SQLite db + seed sample data
pnpm dev                                      # run apps/api (:3001) and apps/web (:3000) together
```

Then visit [http://localhost:3000](http://localhost:3000). Each app also has its own `.env.example` (`apps/api/.env.example`, `apps/web/.env.example`) — copy to `.env` and adjust if needed; sane defaults are already set for local dev.

## Common commands

```bash
pnpm lint      # eslint across all packages
pnpm type      # tsc --noEmit across all packages
pnpm test      # vitest across all packages
pnpm build     # build all packages (api before web — see CLAUDE.md)
pnpm format    # prettier --write
```

A pre-commit hook (husky + lint-staged) runs eslint/prettier on staged files; CI (`.github/workflows/ci.yml`) runs the full lint/type/test/build sequence on every push and PR.

## Project layout

| Path             | What                                                              | Docs                                                                                                 |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `apps/api`       | NestJS backend — REST + tRPC on the same server, Prisma/SQLite    | [`apps/api/README.md`](apps/api/README.md), [`apps/api/prisma/README.md`](apps/api/prisma/README.md) |
| `apps/web`       | Next.js 16 (App Router) frontend                                  | [`apps/web/README.md`](apps/web/README.md)                                                           |
| `packages/types` | Shared Zod schemas, consumed by both apps as the validation layer | —                                                                                                    |

For the deeper "why" behind non-obvious architectural choices (why REST _and_ tRPC, why `apps/api` doesn't run through the standard NestJS build pipeline, how the tRPC router types reach the frontend, the testing setup, etc.), see [`CLAUDE.md`](CLAUDE.md) — written for AI coding agents, but equally useful as a technical reference for a human picking up this repo.

## Known limitations & deliberate trade-offs

This is a starter template, not a production app — a few things are intentionally out of scope rather than overlooked:

- **No real authentication.** There's no session/user-login concept. `authorId` on a todo is trusted at face value from the request body — anything holding the shared `x-api-key` can act as any user. A single shared API key gates mutations on both REST and tRPC instead. See [`apps/api/README.md#known-limitations`](apps/api/README.md#known-limitations).
- **tRPC has no rate limiting of its own.** The global `@nestjs/throttler` guard only covers REST, because `nestjs-trpc` mounts its own Express handler that bypasses Nest's normal request pipeline. Documented in [`apps/api/README.md#security`](apps/api/README.md#security).
- **Pagination exists on the API but isn't wired into the UI.** `findAll` supports `take`/`skip`, but `apps/web` still fetches one window and filters/sorts client-side — see [`apps/api/README.md`](apps/api/README.md).
