import { router } from "../trpc.js";
import { postRouter } from "./post.js";

export const appRouter = router({
  post: postRouter,
});

export type AppRouter = typeof appRouter;
