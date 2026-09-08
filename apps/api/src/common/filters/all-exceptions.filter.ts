import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { STATUS_CODES } from "node:http";
import type { Response } from "express";
import { isPrismaKnownError, mapPrismaError } from "../prisma-error.util.js";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (isPrismaKnownError(exception)) {
      const { status, message } = mapPrismaError(exception);
      response.status(status).json({ statusCode: status, message, error: STATUS_CODES[status] });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR],
    });
  }
}
