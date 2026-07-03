import { Injectable } from "@nestjs/common";
import type { ContextOptions, TRPCContext } from "nestjs-trpc";

@Injectable()
export class AppContext implements TRPCContext {
  create(opts: ContextOptions): Record<string, unknown> {
    return { req: opts.req, res: opts.res };
  }
}
