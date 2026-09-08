import { describe, expect, it } from "vitest";
import { filterAndSortTodos } from "./filter-sort-todos";
import type { TodoListItem } from "./hooks/use-optimistic-todo-list-mutation";

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

describe("filterAndSortTodos", () => {
  const todos = [
    makeTodo({ id: 1, title: "Write report", status: "TODO", priority: "LOW", dueDate: "2026-08-01T00:00:00.000Z" }),
    makeTodo({ id: 2, title: "Fix bug", status: "DONE", priority: "HIGH", dueDate: "2026-07-01T00:00:00.000Z" }),
    makeTodo({ id: 3, title: "Review PR", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: null }),
  ];

  it("filters by case-insensitive title substring", () => {
    const result = filterAndSortTodos(todos, { search: "BUG", statusFilter: "ALL", sortKey: "dueDate" });

    expect(result.map((t) => t.id)).toEqual([2]);
  });

  it("returns everything when search is empty", () => {
    const result = filterAndSortTodos(todos, { search: "", statusFilter: "ALL", sortKey: "dueDate" });

    expect(result).toHaveLength(3);
  });

  it("filters by status, unless statusFilter is ALL", () => {
    const result = filterAndSortTodos(todos, { search: "", statusFilter: "DONE", sortKey: "dueDate" });

    expect(result.map((t) => t.id)).toEqual([2]);
  });

  it("combines search and status filters", () => {
    const result = filterAndSortTodos(todos, { search: "report", statusFilter: "DONE", sortKey: "dueDate" });

    expect(result).toHaveLength(0);
  });

  it("sorts by due date ascending, with todos missing a due date last", () => {
    const result = filterAndSortTodos(todos, { search: "", statusFilter: "ALL", sortKey: "dueDate" });

    expect(result.map((t) => t.id)).toEqual([2, 1, 3]);
  });

  it("sorts by priority, HIGH first", () => {
    const result = filterAndSortTodos(todos, { search: "", statusFilter: "ALL", sortKey: "priority" });

    expect(result.map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it("does not mutate the input array", () => {
    const original = [...todos];
    filterAndSortTodos(todos, { search: "", statusFilter: "ALL", sortKey: "priority" });

    expect(todos).toEqual(original);
  });
});
