import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { firstValueFrom, of } from "rxjs";
import { describe, expect, it } from "vitest";
import { TransformInterceptor } from "./transform.interceptor.js";

function createCallHandler<T>(value: T): CallHandler<T> {
  return { handle: () => of(value) };
}

describe("TransformInterceptor", () => {
  it("wraps the handler's emitted value in a success envelope", async () => {
    const interceptor = new TransformInterceptor<{ id: number }>();
    const context = {} as ExecutionContext;

    const result = await firstValueFrom(interceptor.intercept(context, createCallHandler({ id: 1 })));

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1 });
    expect(typeof result.timestamp).toBe("string");
    expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("passes through arrays and primitives unchanged, just wrapped", async () => {
    const interceptor = new TransformInterceptor<number[]>();
    const context = {} as ExecutionContext;

    const result = await firstValueFrom(interceptor.intercept(context, createCallHandler([1, 2, 3])));

    expect(result.data).toEqual([1, 2, 3]);
  });
});
