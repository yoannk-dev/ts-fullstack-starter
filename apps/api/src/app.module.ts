import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TRPCModule } from "nestjs-trpc";
import { LoggerMiddleware } from "./common/middleware/logger.middleware.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { TodoModule } from "./todo/todo.module.js";
import { AppContext } from "./trpc/app.context.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TodoModule,
    TRPCModule.forRoot({
      context: AppContext,
    }),
  ],
  providers: [AppContext],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
