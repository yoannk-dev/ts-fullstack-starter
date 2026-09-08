import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateTodoInput, UpdateTodoInput } from "@repo/types";
import { Prisma } from "../../prisma/generated/client.js";
import type { Status } from "../../prisma/generated/enums.js";
import { withoutUndefined } from "../common/without-undefined.util.js";
import { PrismaService } from "../prisma/prisma.service.js";

export const DEFAULT_TAKE = 50;
export const MAX_TAKE = 100;

export interface FindAllTodosParams {
  search?: string;
  status?: Status;
  take?: number;
  skip?: number;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ search, status, take, skip }: FindAllTodosParams = {}) {
    return this.prisma.todo.findMany({
      where: {
        ...(search ? { title: { contains: search } } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { created_at: "desc" },
      include: { author: true },
      take: Math.min(take ?? DEFAULT_TAKE, MAX_TAKE),
      skip: skip ?? 0,
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
    return this.prisma.todo.create({ data: withoutUndefined(data) });
  }

  async update(id: number, data: UpdateTodoInput) {
    try {
      return await this.prisma.todo.update({ where: { id }, data: withoutUndefined(data) });
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
