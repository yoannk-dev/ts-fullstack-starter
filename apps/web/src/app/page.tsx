"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import type { Status } from "@repo/types";
import type { AppRouter } from "@repo/api/router";
import type { inferRouterOutputs } from "@trpc/server";
import { ConfirmDialog } from "./_components/confirm-dialog";
import {
  NEXT_STATUS,
  PRIORITY_LABELS,
  PRIORITY_RANK,
  PRIORITY_TEXT_CLASSES,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatDueDate,
} from "./todos/_lib/display";

type TodoListItem = inferRouterOutputs<AppRouter>["todo"]["findAll"][number];

type SortKey = "dueDate" | "priority";

export default function Home() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: todos, isLoading } = useQuery(trpc.todo.findAll.queryOptions());

  const toggleStatus = useMutation(
    trpc.todo.update.mutationOptions({
      onMutate: async ({ id, data }) => {
        const queryKey = trpc.todo.findAll.queryKey();
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(
          queryKey,
          (old) => old?.map((todo) => (todo.id === id ? { ...todo, ...data } : todo)) as typeof old,
        );
        return { previous };
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(trpc.todo.findAll.queryKey(), context.previous);
        }
      },
      onSettled: (_data, _error, variables) => {
        void queryClient.invalidateQueries(trpc.todo.findAll.queryFilter());
        void queryClient.invalidateQueries(trpc.todo.findById.queryFilter({ id: variables.id }));
      },
    }),
  );

  const cycleStatus = (todo: TodoListItem) => {
    toggleStatus.mutate({ id: todo.id, data: { status: NEXT_STATUS[todo.status] } });
  };

  const deleteTodo = useMutation(
    trpc.todo.delete.mutationOptions({
      onMutate: async ({ id }) => {
        const queryKey = trpc.todo.findAll.queryKey();
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(
          queryKey,
          (old) => old?.filter((todo) => todo.id !== id) as typeof old,
        );
        return { previous };
      },
      onError: (_error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(trpc.todo.findAll.queryKey(), context.previous);
        }
      },
      onSettled: (_data, _error, variables) => {
        void queryClient.invalidateQueries(trpc.todo.findAll.queryFilter());
        void queryClient.invalidateQueries(trpc.todo.findById.queryFilter({ id: variables.id }));
      },
    }),
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

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="Search todos…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as Status | "ALL");
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => {
            setSortKey(e.target.value as SortKey);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        >
          <option value="dueDate">Sort by due date</option>
          <option value="priority">Sort by priority</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visibleTodos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No todos match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {visibleTodos.map((todo) => (
            <li
              key={todo.id}
              className="group bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/todos/${String(todo.id)}`}
                    className="font-semibold text-gray-900 group-hover:text-black hover:underline truncate block"
                  >
                    {todo.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        cycleStatus(todo);
                      }}
                      title="Click to advance status"
                      className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-75 transition ${STATUS_BADGE_CLASSES[todo.status]}`}
                    >
                      {STATUS_LABELS[todo.status]}
                    </button>
                    <span className={`text-xs font-medium ${PRIORITY_TEXT_CLASSES[todo.priority]}`}>
                      {PRIORITY_LABELS[todo.priority]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDueDate(todo.dueDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 mt-0.5">
                  <Link
                    href={`/todos/${String(todo.id)}/edit`}
                    className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteId(todo.id);
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
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
