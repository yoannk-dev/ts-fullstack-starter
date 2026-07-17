import { Injectable } from "@nestjs/common";
import type { CreateTodoInput, UpdateTodoInput } from "@repo/types";
import type { Status } from "../../prisma/generated/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface FindAllTodosParams {
  search?: string;
  status?: Status;
}

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ search, status }: FindAllTodosParams = {}) {
    return this.prisma.todo.findMany({
      where: {
        ...(search ? { title: { contains: search } } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { created_at: "desc" },
      include: { author: true },
    });
  }

  findOne(id: number) {
    return this.prisma.todo.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  create(data: CreateTodoInput) {
    return this.prisma.todo.create({ data });
  }

  update(id: number, data: UpdateTodoInput) {
    return this.prisma.todo.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.todo.delete({ where: { id } });
  }
}
