# Prisma

This folder contains everything related to the database: schema, migrations, and configuration.

## What is Prisma?

[Prisma](https://www.prisma.io/) is a TypeScript ORM. The schema defined in `schema.prisma` is the single source of truth: it describes models, relations, and the database provider. From this schema, Prisma generates a typed client in `generated/` used throughout the codebase to query the database.

## Migrations

Create a migration after modifying the schema:

```bash
pnpm db:migrate --name name
```

Open Prisma Studio (visual database UI):

```bash
pnpm db:studio
```

## Seeding

`prisma/seed.ts` populates the database with a default user and a handful of realistic todos (varied statuses/priorities, some due dates in the past and some in the future, so sorting/filtering has something to show). The seed command is registered in `prisma.config.ts` (`migrations.seed`), so it also runs automatically after `pnpm db:migrate`. To run it on demand:

```bash
pnpm db:seed
```

## Client generation

The typed client is generated in `prisma/generated/` from the schema. It is automatically regenerated after each `pnpm install` (via `postinstall`). To regenerate it manually:

```bash
pnpm prisma generate
```
