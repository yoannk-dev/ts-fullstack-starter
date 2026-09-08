import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateTodoInput, UpdateTodoInput } from "@repo/types";
import { Prisma } from "../../prisma/generated/client.js";
import type { Status } from "../../prisma/generated/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface FindAllTodosParams {
  search?: string;
  status?: Status;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
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

  async findOne(id: number) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!todo) {
      throw new NotFoundException(`Todo ${String(id)} not found`);
    }
    return todo;
  }

  create(data: CreateTodoInput) {
    return this.prisma.todo.create({ data });
  }

  async update(id: number, data: UpdateTodoInput) {
    try {
      return await this.prisma.todo.update({ where: { id }, data });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new NotFoundException(`Todo ${String(id)} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.todo.delete({ where: { id } });
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new NotFoundException(`Todo ${String(id)} not found`);
      }
      throw error;
    }
  }
}
