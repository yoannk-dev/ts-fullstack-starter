"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import {
  PRIORITY_LABELS,
  PRIORITY_TEXT_CLASSES,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatDateTime,
  formatDueDate,
} from "../_lib/display";

export default function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const todoId = Number(id);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: todo, isLoading, error } = useQuery(trpc.todo.findById.queryOptions({ id: todoId }));
  const isNotFound = error?.data?.code === "NOT_FOUND";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteTodo = useMutation(
    trpc.todo.delete.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.todo.findAll.queryFilter()),
          queryClient.invalidateQueries(trpc.todo.findById.queryFilter({ id: todoId })),
        ]);
        router.push("/");
      },
    }),
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button
          onClick={() => {
            router.back();
          }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Todo details</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isNotFound ? (
        <p className="text-sm text-gray-400">This todo could not be found.</p>
      ) : error ? (
        <p className="text-sm text-red-600">
          Something went wrong loading this todo. Please try again.
        </p>
      ) : todo ? (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">{todo.title}</h2>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE_CLASSES[todo.status]}`}
              >
                {STATUS_LABELS[todo.status]}
              </span>
            </div>

            {todo.description && <p className="text-sm text-gray-600">{todo.description}</p>}

            <dl className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100">
              <div>
                <dt className="text-gray-400">Priority</dt>
                <dd className={`font-medium ${PRIORITY_TEXT_CLASSES[todo.priority]}`}>
                  {PRIORITY_LABELS[todo.priority]}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Due date</dt>
                <dd className="font-medium text-gray-900">{formatDueDate(todo.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Created</dt>
                <dd className="font-medium text-gray-900">{formatDateTime(todo.created_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Last updated</dt>
                <dd className="font-medium text-gray-900">{formatDateTime(todo.updated_at)}</dd>
              </div>
              {todo.author && (
                <div className="col-span-2">
                  <dt className="text-gray-400">Author</dt>
                  <dd className="font-medium text-gray-900">
                    {todo.author.name ?? todo.author.email}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
            <Link
              href={`/todos/${String(todo.id)}/edit`}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this todo?"
        description={todo ? `"${todo.title}" will be permanently deleted.` : "This todo will be permanently deleted."}
        confirmLabel="Delete"
        onConfirm={() => {
          setConfirmOpen(false);
          deleteTodo.mutate({ id: todoId });
        }}
        onCancel={() => {
          setConfirmOpen(false);
        }}
      />
    </main>
  );
}
