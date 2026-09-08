import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TRPCModule } from "nestjs-trpc";
import { LoggerMiddleware } from "./common/middleware/logger.middleware.js";
import { validateEnv } from "./env.validation.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { TodoModule } from "./todo/todo.module.js";
import { AppContext } from "./trpc/app.context.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] }),
    PrismaModule,
    TodoModule,
    TRPCModule.forRoot({
      context: AppContext,
    }),
  ],
  providers: [AppContext, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
