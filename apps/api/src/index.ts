import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router/index.js";
import { createContext } from "./trpc.js";
import { prisma } from "./db.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

const shutdown = () => {
  server.close(() => prisma.$disconnect().then(() => process.exit(0)));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
