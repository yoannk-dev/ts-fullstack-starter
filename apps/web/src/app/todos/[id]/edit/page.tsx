"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { BackButton } from "../../_components/back-button";
import { TodoForm, type TodoFormValues } from "../../_components/todo-form";
import { TodoSkeleton } from "../../../_components/todo-skeleton";

export default function EditTodoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const todoId = Number(id);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data: todo,
    isLoading,
    error: loadError,
  } = useQuery(trpc.todo.findById.queryOptions({ id: todoId }));
  const isNotFound = loadError?.data?.code === "NOT_FOUND";
  const { mutateAsync, error: submitErrorValue } = useMutation(trpc.todo.update.mutationOptions());

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
        <BackButton />
        <h1 className="text-3xl font-bold tracking-tight">Edit todo</h1>
      </div>

      {isLoading ? (
        <TodoSkeleton rows={4} rowHeight="h-12" />
      ) : isNotFound ? (
        <p className="text-sm text-gray-500">This todo could not be found.</p>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Something went wrong loading this todo. Please try again.
        </p>
      ) : todo ? (
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
          submitError={Boolean(submitErrorValue)}
        />
      ) : null}
    </main>
  );
}
