import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { TodoRouter } from "../trpc/todo.router.js";
import { TodoController } from "./todo.controller.js";
import { TodoService } from "./todo.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [TodoController],
  providers: [TodoService, TodoRouter],
})
export class TodoModule {}
