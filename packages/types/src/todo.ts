import { z } from "zod";
import { UserSchema } from "./user";

export const StatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export type Status = z.infer<typeof StatusSchema>;

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const TodoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  status: StatusSchema,
  priority: PrioritySchema,
  dueDate: z.coerce.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  authorId: z.number().int().positive(),
  author: UserSchema.optional(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const CreateTodoSchema = TodoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  author: true,
}).extend({
  description: z.string().nullable().optional(),
  status: StatusSchema.optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;

export const UpdateTodoSchema = TodoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  author: true,
  authorId: true,
}).partial();

export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
