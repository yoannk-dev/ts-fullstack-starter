"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/api/trpc/client";
import { TodoForm, type TodoFormValues } from "@/components/todos/todo-form";
import { TodoQueryState } from "@/components/todos/todo-query-state";
import { todoRoutes } from "@/routing/paths";

const EditTodoPage = ({ params }: { params: Promise<{ id: string }> }) => {
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
    router.push(todoRoutes.list);
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit todo</h1>
      <TodoQueryState isLoading={isLoading} isNotFound={isNotFound} error={loadError} data={todo}>
        {(todo) => (
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
        )}
      </TodoQueryState>
    </>
  );
};

export default EditTodoPage;
