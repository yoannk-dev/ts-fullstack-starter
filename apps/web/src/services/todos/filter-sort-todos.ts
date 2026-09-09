import type { Status } from "@repo/types";
import type { TodoListItem } from "@/hooks/todos/use-optimistic-todo-list-mutation";
import { PRIORITY_RANK } from "./todo-display";

export type SortKey = "dueDate" | "priority";

export interface TodoListFilters {
  search: string;
  statusFilter: Status | "ALL";
  sortKey: SortKey;
}

export const filterAndSortTodos = (
  todos: TodoListItem[],
  { search, statusFilter, sortKey }: TodoListFilters,
) => {
  const filtered = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || todo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return [...filtered].sort((a, b) => {
    if (sortKey === "priority") {
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    }
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};
