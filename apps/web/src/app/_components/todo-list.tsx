"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { useOptimisticTodoListMutation, type TodoListItem } from "@/lib/hooks/use-optimistic-todo-list-mutation";
import type { Status } from "@repo/types";
import { ConfirmDialog } from "./confirm-dialog";
import { FilterBar, type SortKey } from "./filter-bar";
import { TodoRow } from "./todo-row";
import { NEXT_STATUS, PRIORITY_RANK } from "../todos/_lib/display";

export function TodoList() {
  const trpc = useTRPC();
  const { data: todos, isLoading, error } = useQuery(trpc.todo.findAll.queryOptions());

  const toggleStatus = useOptimisticTodoListMutation(
    trpc.todo.update.mutationOptions(),
    // Only `status` is ever sent by cycleStatus below — merging arbitrary
    // `data` here would need to reconcile its pre-wire `Date` typing against
    // the list's already-serialized `string` dueDate, for a field this
    // mutation never actually touches.
    (list, { id, data }) =>
      list?.map((todo) => (todo.id === id && data.status ? { ...todo, status: data.status } : todo)),
  );

  const deleteTodo = useOptimisticTodoListMutation(trpc.todo.delete.mutationOptions(), (list, { id }) =>
    list?.filter((todo) => todo.id !== id),
  );

  const cycleStatus = (todo: TodoListItem) => {
    toggleStatus.mutate({ id: todo.id, data: { status: NEXT_STATUS[todo.status] } });
  };

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

  const visibleTodos = useMemo(() => {
    if (!todos) return [];

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
  }, [todos, search, statusFilter, sortKey]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
        <Link
          href="/todos/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          + New todo
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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-600 text-center py-12">
          Something went wrong loading your todos. Please try again.
        </p>
      ) : visibleTodos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No todos match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {visibleTodos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} onCycleStatus={cycleStatus} onRequestDelete={setPendingDeleteId} />
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
}
