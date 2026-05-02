import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router/index.js";
import { createContext } from "./trpc.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
