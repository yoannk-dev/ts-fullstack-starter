import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TRPCModule } from "nestjs-trpc";
import { LoggerMiddleware } from "./common/middleware/logger.middleware.js";
import { PostModule } from "./post/post.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AppContext } from "./trpc/app.context.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PostModule,
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
