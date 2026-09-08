import { HttpStatus } from "@nestjs/common";
import { Prisma } from "../../prisma/generated/client.js";

export function isPrismaKnownError(
  error: unknown,
): error is InstanceType<typeof Prisma.PrismaClientKnownRequestError> {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

interface PrismaErrorMapping {
  status: number;
  message: string;
}

/**
 * Prisma error codes we know how to translate into a client-facing
 * status/message. Anything not listed here falls back to a generic
 * 500 — better an unmapped error stays opaque than we guess wrong.
 * @see https://www.prisma.io/docs/orm/reference/error-reference
 */
const PRISMA_ERROR_MAP: Record<string, PrismaErrorMapping> = {
  P2025: { status: HttpStatus.NOT_FOUND, message: "Record not found" },
  P2002: { status: HttpStatus.CONFLICT, message: "A record with this value already exists" },
  P2003: { status: HttpStatus.BAD_REQUEST, message: "Referenced record does not exist" },
};

export function mapPrismaError(
  error: InstanceType<typeof Prisma.PrismaClientKnownRequestError>,
): PrismaErrorMapping {
  return PRISMA_ERROR_MAP[error.code] ?? { status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Database error" };
}
