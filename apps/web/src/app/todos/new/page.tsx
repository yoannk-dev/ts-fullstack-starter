"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { BackButton } from "../_components/back-button";
import { TodoForm, type TodoFormValues } from "../_components/todo-form";

export default function NewTodoPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, error } = useMutation(trpc.todo.create.mutationOptions());

  const onSubmit = async (values: TodoFormValues) => {
    await mutateAsync({
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      authorId: 1,
    });
    await queryClient.invalidateQueries(trpc.todo.findAll.queryFilter());
    router.push("/");
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold tracking-tight">New todo</h1>
      </div>

      <TodoForm
        onSubmit={onSubmit}
        submitLabel="Create todo"
        pendingLabel="Creating…"
        submitError={Boolean(error)}
      />
    </main>
  );
}
