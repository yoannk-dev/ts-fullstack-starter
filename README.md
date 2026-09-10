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
pnpm --filter @repo/api db:migrate            # apply migrations to a local SQLite db
pnpm --filter @repo/api db:seed               # optional: populate with sample todos
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
