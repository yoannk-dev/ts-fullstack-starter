"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/api/trpc/client";
import { useOptimisticTodoListMutation } from "@/hooks/todos/use-optimistic-todo-list-mutation";
import { filterAndSortTodos, type SortKey } from "@/services/todos/filter-sort-todos";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TodoSkeleton } from "@/components/todo-skeleton";
import { todoRoutes } from "@/routing/paths";
import type { Status } from "@repo/types";
import { FilterBar } from "./filter-bar";
import { TodoRow } from "./todo-row";

export const TodoList = () => {
  const trpc = useTRPC();
  const { data: todos, isLoading, error } = useQuery(trpc.todo.findAll.queryOptions());

  const deleteTodo = useOptimisticTodoListMutation(
    trpc.todo.delete.mutationOptions(),
    (list, { id }) => list?.filter((todo) => todo.id !== id),
  );

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const pendingDeleteTodo = todos?.find((todo) => todo.id === pendingDeleteId);

  const confirmDelete = () => {
    if (pendingDeleteId === null) return;
    deleteTodo.mutate({ id: pendingDeleteId });
    setPendingDeleteId(null);
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");

  const visibleTodos = useMemo(
    () => (todos ? filterAndSortTodos(todos, { search, statusFilter, sortKey }) : []),
    [todos, search, statusFilter, sortKey],
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <Link
          href={todoRoutes.new}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          + New
        </Link>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
      />

      {isLoading ? (
        <TodoSkeleton rows={3} />
      ) : error ? (
        <p className="text-sm text-red-600 text-center py-12">
          Something went wrong loading your todos. Please try again.
        </p>
      ) : visibleTodos.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-12">No todos match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {visibleTodos.map((todo) => (
            <TodoRow
              key={`todo-${String(todo.id)}`}
              todo={todo}
              onRequestDelete={setPendingDeleteId}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this todo?"
        description={
          pendingDeleteTodo
            ? `"${pendingDeleteTodo.title}" will be permanently deleted.`
            : "This todo will be permanently deleted."
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDeleteId(null);
        }}
      />
    </main>
  );
};
