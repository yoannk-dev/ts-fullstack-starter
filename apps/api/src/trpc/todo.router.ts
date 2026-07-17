import { Injectable } from "@nestjs/common";
import { CreateTodoSchema, StatusSchema, TodoSchema, UpdateTodoSchema } from "@repo/types";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { z } from "zod";
import { TodoService } from "../todo/todo.service.js";

const idInput = z.object({ id: z.number().int() });
const updateInput = z.object({ id: z.number().int(), data: UpdateTodoSchema });
const findAllInput = z
  .object({ search: z.string().optional(), status: StatusSchema.optional() })
  .optional();

@Router({ alias: "todo" })
@Injectable()
export class TodoRouter {
  constructor(private readonly todoService: TodoService) {}

  @Query({ input: findAllInput, output: z.array(TodoSchema) })
  findAll(@Input() input: z.infer<typeof findAllInput>) {
    return this.todoService.findAll(input);
  }

  @Query({ input: idInput, output: TodoSchema.nullable() })
  findById(@Input() input: z.infer<typeof idInput>) {
    return this.todoService.findOne(input.id);
  }

  @Mutation({ input: CreateTodoSchema, output: TodoSchema })
  create(@Input() input: z.infer<typeof CreateTodoSchema>) {
    return this.todoService.create(input);
  }

  @Mutation({ input: updateInput, output: TodoSchema })
  update(@Input() input: z.infer<typeof updateInput>) {
    return this.todoService.update(input.id, input.data);
  }

  @Mutation({ input: idInput, output: TodoSchema })
  delete(@Input() input: z.infer<typeof idInput>) {
    return this.todoService.remove(input.id);
  }
}
