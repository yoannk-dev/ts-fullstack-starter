"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@repo/api/router";
import { useTRPC } from "@/api/trpc/client";
import {
  applyOptimisticUpdate,
  rollbackOptimisticUpdate,
  type OptimisticContext,
  type TodoListItem,
} from "@/services/todos/optimistic-todo-list-cache";

export type { TodoListItem };

export const useOptimisticTodoListMutation = <TVariables extends { id: number }, TData>(
  baseOptions: UseMutationOptions<TData, TRPCClientErrorLike<AppRouter>, TVariables>,
  updateList: (
    todos: TodoListItem[] | undefined,
    variables: TVariables,
  ) => TodoListItem[] | undefined,
) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.todo.findAll.queryKey();

  return useMutation<TData, TRPCClientErrorLike<AppRouter>, TVariables, OptimisticContext>({
    ...baseOptions,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      return applyOptimisticUpdate(queryClient, queryKey, updateList, variables);
    },
    onError: (_error, _variables, context) => {
      rollbackOptimisticUpdate(queryClient, queryKey, context);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries(trpc.todo.findAll.queryFilter());
      void queryClient.invalidateQueries(trpc.todo.findById.queryFilter({ id: variables.id }));
    },
  });
};
