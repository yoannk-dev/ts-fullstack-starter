import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/client.js";
import type { Priority, Status } from "./generated/enums.js";

const dbPath = path.resolve(import.meta.dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const day = 24 * 60 * 60 * 1000;
const daysFromNow = (n: number) => new Date(Date.now() + n * day);

const todos: {
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: Date | null;
}[] = [
  {
    title: "Write Q3 report",
    description: "Include revenue breakdown and forecast",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: daysFromNow(3),
  },
  {
    title: "Fix login bug",
    description: "Users get logged out after a few minutes",
    status: "TODO",
    priority: "HIGH",
    dueDate: daysFromNow(-2),
  },
  {
    title: "Buy groceries",
    description: null,
    status: "TODO",
    priority: "LOW",
    dueDate: null,
  },
  {
    title: "Plan team offsite",
    description: "Book a venue and send invites",
    status: "DONE",
    priority: "MEDIUM",
    dueDate: daysFromNow(-14),
  },
  {
    title: "Review pull requests",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: daysFromNow(1),
  },
  {
    title: "Renew domain name",
    description: "Expires soon, don't forget",
    status: "TODO",
    priority: "HIGH",
    dueDate: daysFromNow(-1),
  },
  {
    title: "Update dependencies",
    description: "Bump workspace packages to their latest minor versions",
    status: "IN_PROGRESS",
    priority: "LOW",
    dueDate: daysFromNow(10),
  },
  {
    title: "Prepare demo script",
    description: "Walkthrough for the upcoming client call",
    status: "DONE",
    priority: "MEDIUM",
    dueDate: daysFromNow(-5),
  },
];

async function main() {
  const author = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Admin" },
  });

  await prisma.todo.deleteMany({ where: { authorId: author.id } });

  for (const todo of todos) {
    await prisma.todo.create({ data: { ...todo, authorId: author.id } });
  }

  console.log(`Seeded ${String(todos.length)} todos for ${author.email}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
