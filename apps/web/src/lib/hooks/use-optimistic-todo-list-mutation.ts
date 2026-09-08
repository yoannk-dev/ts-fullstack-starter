"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@repo/api/router";
import type { inferRouterOutputs } from "@trpc/server";
import { useTRPC } from "@/lib/trpc/react";

export type TodoListItem = inferRouterOutputs<AppRouter>["todo"]["findAll"][number];

interface OptimisticContext {
  previous: TodoListItem[] | undefined;
}

/**
 * Shared optimistic-update plumbing for mutations that affect the todo list
 * (toggle status, delete): snapshot the list, apply `updateList` immediately,
 * roll back on error, and revalidate once the server responds. `updateList`
 * is the only thing that differs between call sites — it replaces the two
 * near-identical onMutate/onError/onSettled blocks that used to live in the
 * list page directly.
 */
export function useOptimisticTodoListMutation<TVariables extends { id: number }, TData>(
  baseOptions: UseMutationOptions<TData, TRPCClientErrorLike<AppRouter>, TVariables>,
  updateList: (todos: TodoListItem[] | undefined, variables: TVariables) => TodoListItem[] | undefined,
) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation<TData, TRPCClientErrorLike<AppRouter>, TVariables, OptimisticContext>({
    ...baseOptions,
    onMutate: async (variables) => {
      const queryKey = trpc.todo.findAll.queryKey();
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodoListItem[]>(queryKey);
      queryClient.setQueryData<TodoListItem[]>(queryKey, (old) => updateList(old, variables));
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
  });
}
