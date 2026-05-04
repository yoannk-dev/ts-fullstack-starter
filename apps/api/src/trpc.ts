import { initTRPC } from "@trpc/server";
import type { Request, Response } from "express";

export type Context = {
  req: Request;
  res: Response;
};

export const createContext = ({ req, res }: { req: Request; res: Response }): Context => ({
  req,
  res,
});

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
