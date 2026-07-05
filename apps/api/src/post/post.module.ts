import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PostRouter } from "../trpc/post.router.js";
import { PostController } from "./post.controller.js";
import { PostService } from "./post.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [PostController],
  providers: [PostService, PostRouter],
})
export class PostModule {}
