import { Injectable } from "@nestjs/common";
import { CreateTodoSchema, StatusSchema, TodoSchema, UpdateTodoSchema } from "@repo/types";
import { Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { z } from "zod";
import { MAX_TAKE, TodoService } from "../todo/todo.service.js";
import { TrpcApiKeyMiddleware } from "./api-key.middleware.js";
import { callTodoProcedure } from "./trpc-error.util.js";

const idInput = z.object({ id: z.number().int() });
const updateInput = z.object({ id: z.number().int(), data: UpdateTodoSchema });
const findAllInput = z
  .object({
    search: z.string().optional(),
    status: StatusSchema.optional(),
    take: z.number().int().positive().max(MAX_TAKE).optional(),
    skip: z.number().int().nonnegative().optional(),
  })
  .optional();

@Router({ alias: "todo" })
@Injectable()
export class TodoRouter {
  constructor(private readonly todoService: TodoService) {}

  @Query({ input: findAllInput, output: z.array(TodoSchema) })
  findAll(@Input() input: z.infer<typeof findAllInput>) {
    return callTodoProcedure(() => this.todoService.findAll(input ?? {}));
  }

  @Query({ input: idInput, output: TodoSchema })
  findById(@Input() input: z.infer<typeof idInput>) {
    return callTodoProcedure(() => this.todoService.findOne(input.id));
  }

  @UseMiddlewares(TrpcApiKeyMiddleware)
  @Mutation({ input: CreateTodoSchema, output: TodoSchema })
  create(@Input() input: z.infer<typeof CreateTodoSchema>) {
    return callTodoProcedure(() => this.todoService.create(input));
  }

  @UseMiddlewares(TrpcApiKeyMiddleware)
  @Mutation({ input: updateInput, output: TodoSchema })
  update(@Input() input: z.infer<typeof updateInput>) {
    return callTodoProcedure(() => this.todoService.update(input.id, input.data));
  }

  @UseMiddlewares(TrpcApiKeyMiddleware)
  @Mutation({ input: idInput, output: TodoSchema })
  delete(@Input() input: z.infer<typeof idInput>) {
    return callTodoProcedure(() => this.todoService.remove(input.id));
  }
}
