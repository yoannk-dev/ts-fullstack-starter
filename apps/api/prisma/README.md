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

## Client generation

The typed client is generated in `prisma/generated/` from the schema. It is automatically regenerated after each `pnpm install` (via `postinstall`). To regenerate it manually:

```bash
pnpm prisma generate
```
