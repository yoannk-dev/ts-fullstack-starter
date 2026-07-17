"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { TodoForm, type TodoFormValues } from "../../_components/todo-form";

export default function EditTodoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const todoId = Number(id);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: todo, isLoading } = useQuery(trpc.todo.findById.queryOptions({ id: todoId }));
  const { mutateAsync, error } = useMutation(trpc.todo.update.mutationOptions());

  const onSubmit = async (values: TodoFormValues) => {
    await mutateAsync({
      id: todoId,
      data: {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate) : null,
      },
    });
    await Promise.all([
      queryClient.invalidateQueries(trpc.todo.findAll.queryFilter()),
      queryClient.invalidateQueries(trpc.todo.findById.queryFilter({ id: todoId })),
    ]);
    router.push("/");
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Edit todo</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !todo ? (
        <p className="text-sm text-gray-400">This todo could not be found.</p>
      ) : (
        <TodoForm
          defaultValues={{
            title: todo.title,
            description: todo.description ?? undefined,
            status: todo.status,
            priority: todo.priority,
            dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 10) : undefined,
          }}
          onSubmit={onSubmit}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          submitError={Boolean(error)}
        />
      )}
    </main>
  );
}
