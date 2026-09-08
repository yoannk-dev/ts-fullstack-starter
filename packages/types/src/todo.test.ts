import { describe, expect, it } from "vitest";
import { CreateTodoSchema, StatusSchema, TodoSchema, UpdateTodoSchema } from "./todo";

const validTodo = {
  id: 1,
  title: "Write the report",
  description: "Quarterly numbers",
  status: "TODO" as const,
  priority: "MEDIUM" as const,
  dueDate: null,
  created_at: new Date("2026-01-01"),
  updated_at: new Date("2026-01-01"),
  authorId: 1,
};

describe("StatusSchema", () => {
  it("accepts the three known statuses", () => {
    for (const status of ["TODO", "IN_PROGRESS", "DONE"]) {
      expect(StatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("rejects anything else", () => {
    expect(StatusSchema.safeParse("ARCHIVED").success).toBe(false);
  });
});

describe("TodoSchema", () => {
  it("accepts a fully valid todo", () => {
    expect(TodoSchema.safeParse(validTodo).success).toBe(true);
  });

  it("rejects a title over 255 characters", () => {
    const result = TodoSchema.safeParse({ ...validTodo, title: "a".repeat(256) });

    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = TodoSchema.safeParse({ ...validTodo, title: "" });

    expect(result.success).toBe(false);
  });

  it("allows description to be explicitly null but not omitted", () => {
    expect(TodoSchema.safeParse({ ...validTodo, description: null }).success).toBe(true);
    const { description: _description, ...withoutDescription } = validTodo;
    expect(TodoSchema.safeParse(withoutDescription).success).toBe(false);
  });

  it("rejects a non-positive id or authorId", () => {
    expect(TodoSchema.safeParse({ ...validTodo, id: 0 }).success).toBe(false);
    expect(TodoSchema.safeParse({ ...validTodo, authorId: -1 }).success).toBe(false);
  });
});

describe("CreateTodoSchema", () => {
  it("only requires title and authorId", () => {
    const result = CreateTodoSchema.safeParse({ title: "New todo", authorId: 1 });

    expect(result.success).toBe(true);
  });

  it("defaults are not applied by the schema itself (status/priority stay undefined when omitted)", () => {
    const result = CreateTodoSchema.safeParse({ title: "New todo", authorId: 1 });

    expect(result.success && result.data.status).toBeUndefined();
  });

  it("still rejects an empty title", () => {
    expect(CreateTodoSchema.safeParse({ title: "", authorId: 1 }).success).toBe(false);
  });

  it("allows description to be omitted, unlike the base TodoSchema", () => {
    expect(CreateTodoSchema.safeParse({ title: "New todo", authorId: 1 }).success).toBe(true);
  });

  it("coerces a due date string into a Date", () => {
    const result = CreateTodoSchema.safeParse({
      title: "New todo",
      authorId: 1,
      dueDate: "2026-08-01T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.dueDate).toBeInstanceOf(Date);
  });
});

describe("UpdateTodoSchema", () => {
  it("accepts a partial update with a single field", () => {
    expect(UpdateTodoSchema.safeParse({ status: "DONE" }).success).toBe(true);
  });

  it("accepts an empty object (no-op update)", () => {
    expect(UpdateTodoSchema.safeParse({}).success).toBe(true);
  });

  it("does not accept authorId (immutable via update)", () => {
    const result = UpdateTodoSchema.safeParse({ authorId: 2 });

    // authorId isn't part of the schema, so it's stripped rather than
    // rejected — this asserts it doesn't come back out, not that parsing fails.
    expect(result.success && "authorId" in result.data).toBe(false);
  });

  it("still rejects an invalid status value", () => {
    expect(UpdateTodoSchema.safeParse({ status: "CANCELLED" }).success).toBe(false);
  });
});
