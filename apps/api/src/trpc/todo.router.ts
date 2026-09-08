import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTodoSchema, StatusSchema, TodoSchema, UpdateTodoSchema } from "@repo/types";
import { TRPCError } from "@trpc/server";
import { Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { z } from "zod";
import { TodoService } from "../todo/todo.service.js";
import { TrpcApiKeyMiddleware } from "./api-key.middleware.js";

const idInput = z.object({ id: z.number().int() });
const updateInput = z.object({ id: z.number().int(), data: UpdateTodoSchema });
const findAllInput = z
  .object({ search: z.string().optional(), status: StatusSchema.optional() })
  .optional();

async function rethrowAsTRPCError<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw new TRPCError({ code: "NOT_FOUND", message: error.message });
    }
    throw error;
  }
}

@Router({ alias: "todo" })
@Injectable()
export class TodoRouter {
  constructor(private readonly todoService: TodoService) {}

  @Query({ input: findAllInput, output: z.array(TodoSchema) })
  findAll(@Input() input: z.infer<typeof findAllInput>) {
    return this.todoService.findAll(input);
  }

  @Query({ input: idInput, output: TodoSchema })
  findById(@Input() input: z.infer<typeof idInput>) {
    return rethrowAsTRPCError(() => this.todoService.findOne(input.id));
  }

  @UseMiddlewares(TrpcApiKeyMiddleware)
  @Mutation({ input: CreateTodoSchema, output: TodoSchema })
  create(@Input() input: z.infer<typeof CreateTodoSchema>) {
    return this.todoService.create(input);
  }

  @UseMiddlewares(TrpcApiKeyMiddleware)
  @Mutation({ input: updateInput, output: TodoSchema })
  update(@Input() input: z.infer<typeof updateInput>) {
    return rethrowAsTRPCError(() => this.todoService.update(input.id, input.data));
  }

  @UseMiddlewares(TrpcApiKeyMiddleware)
  @Mutation({ input: idInput, output: TodoSchema })
  delete(@Input() input: z.infer<typeof idInput>) {
    return rethrowAsTRPCError(() => this.todoService.remove(input.id));
  }
}
