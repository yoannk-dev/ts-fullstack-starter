import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";
import { ApiKeyGuard } from "./api-key.guard.js";

function createContext(headers: Record<string, string | undefined>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

function createConfigService(apiKey: string | undefined): ConfigService {
  return { get: vi.fn().mockReturnValue(apiKey) } as unknown as ConfigService;
}

describe("ApiKeyGuard", () => {
  it("allows the request when the header matches the configured key", () => {
    const guard = new ApiKeyGuard(createConfigService("secret"));
    const context = createContext({ "x-api-key": "secret" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("throws UnauthorizedException when the header is missing", () => {
    const guard = new ApiKeyGuard(createConfigService("secret"));
    const context = createContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException when the header doesn't match", () => {
    const guard = new ApiKeyGuard(createConfigService("secret"));
    const context = createContext({ "x-api-key": "wrong-key" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException when no API key is configured at all", () => {
    const guard = new ApiKeyGuard(createConfigService(undefined));
    const context = createContext({ "x-api-key": "anything" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
