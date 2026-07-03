import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers["x-api-key"];
    const expectedApiKey = this.configService.get<string>("API_KEY");

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new UnauthorizedException("Invalid or missing API key");
    }

    return true;
  }
}
