import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { applyOptimisticUpdate, rollbackOptimisticUpdate, type TodoListItem } from "./optimistic-todo-list-cache";

function makeTodo(overrides: Partial<TodoListItem>): TodoListItem {
  return {
    id: 1,
    title: "Untitled",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    authorId: 1,
    ...overrides,
  };
}

const queryKey = ["todo", "findAll"];

describe("applyOptimisticUpdate / rollbackOptimisticUpdate", () => {
  it("applies updateList to the cached list and returns the prior snapshot", () => {
    const queryClient = new QueryClient();
    const todos = [makeTodo({ id: 1, status: "TODO" }), makeTodo({ id: 2, status: "DONE" })];
    queryClient.setQueryData(queryKey, todos);

    const context = applyOptimisticUpdate(
      queryClient,
      queryKey,
      (list, { id }: { id: number }) => list?.map((t) => (t.id === id ? { ...t, status: "DONE" } : t)),
      { id: 1 },
    );

    expect(context.previous).toEqual(todos);
    expect(queryClient.getQueryData<TodoListItem[]>(queryKey)).toEqual([
      makeTodo({ id: 1, status: "DONE" }),
      makeTodo({ id: 2, status: "DONE" }),
    ]);
  });

  it("supports removing an item (the delete case)", () => {
    const queryClient = new QueryClient();
    const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2 })];
    queryClient.setQueryData(queryKey, todos);

    applyOptimisticUpdate(queryClient, queryKey, (list, { id }: { id: number }) => list?.filter((t) => t.id !== id), {
      id: 1,
    });

    expect(queryClient.getQueryData<TodoListItem[]>(queryKey)).toEqual([makeTodo({ id: 2 })]);
  });

  it("returns undefined as the snapshot when the cache was empty", () => {
    const queryClient = new QueryClient();

    const context = applyOptimisticUpdate(queryClient, queryKey, (list) => list, { id: 1 });

    expect(context.previous).toBeUndefined();
  });

  it("rollbackOptimisticUpdate restores the exact pre-mutation snapshot", () => {
    const queryClient = new QueryClient();
    const original = [makeTodo({ id: 1, status: "TODO" }), makeTodo({ id: 2, status: "DONE" })];
    queryClient.setQueryData(queryKey, original);

    const context = applyOptimisticUpdate(queryClient, queryKey, (list) => list?.filter((t) => t.id !== 1), {
      id: 1,
    });
    // Simulate the mutation failing after the optimistic update was applied.
    rollbackOptimisticUpdate(queryClient, queryKey, context);

    expect(queryClient.getQueryData<TodoListItem[]>(queryKey)).toEqual(original);
  });

  it("rollbackOptimisticUpdate is a no-op when there was nothing to restore", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKey, [makeTodo({ id: 1 })]);

    rollbackOptimisticUpdate(queryClient, queryKey, { previous: undefined });

    expect(queryClient.getQueryData<TodoListItem[]>(queryKey)).toEqual([makeTodo({ id: 1 })]);
  });
});
