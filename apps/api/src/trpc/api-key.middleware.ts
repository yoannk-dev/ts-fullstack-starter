import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TRPCError } from "@trpc/server";
import type { MiddlewareOptions, TRPCMiddleware } from "nestjs-trpc";
import type { Request } from "express";

@Injectable()
export class TrpcApiKeyMiddleware implements TRPCMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(opts: MiddlewareOptions) {
    const { req } = opts.ctx as { req: Request };
    const apiKey = req.headers["x-api-key"];
    const expectedApiKey = this.configService.get<string>("API_KEY");

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or missing API key" });
    }

    return opts.next();
  }
}
