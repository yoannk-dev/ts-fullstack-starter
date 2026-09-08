import { HttpException } from "@nestjs/common";
import { TRPCError, type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { isPrismaKnownError, mapPrismaError } from "../common/prisma-error.util.js";

const HTTP_STATUS_TO_TRPC_CODE: Record<number, TRPC_ERROR_CODE_KEY> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "TOO_MANY_REQUESTS",
};

function toTRPCCode(httpStatus: number): TRPC_ERROR_CODE_KEY {
  return HTTP_STATUS_TO_TRPC_CODE[httpStatus] ?? "INTERNAL_SERVER_ERROR";
}

/**
 * Safety net mirroring AllExceptionsFilter on the REST side: translates any
 * NestJS HttpException (thrown deliberately, e.g. NotFoundException) or
 * unanticipated Prisma error (e.g. a foreign key violation) into a TRPCError
 * with the right code and a sanitized message, instead of leaking the raw
 * Prisma error message to the client.
 */
export async function callTodoProcedure<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof HttpException) {
      throw new TRPCError({ code: toTRPCCode(error.getStatus()), message: error.message });
    }
    if (isPrismaKnownError(error)) {
      const { status, message } = mapPrismaError(error);
      throw new TRPCError({ code: toTRPCCode(status), message });
    }
    throw error;
  }
}
