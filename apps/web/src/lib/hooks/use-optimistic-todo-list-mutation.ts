"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@repo/api/router";
import { useTRPC } from "@/lib/trpc/react";
import {
  applyOptimisticUpdate,
  rollbackOptimisticUpdate,
  type OptimisticContext,
  type TodoListItem,
} from "./optimistic-todo-list-cache";

export type { TodoListItem };

/**
 * Shared optimistic-update plumbing for mutations that affect the todo list
 * (toggle status, delete): snapshot the list, apply `updateList` immediately,
 * roll back on error, and revalidate once the server responds. `updateList`
 * is the only thing that differs between call sites — it replaces the two
 * near-identical onMutate/onError/onSettled blocks that used to live in the
 * list page directly. The actual cache read/write lives in
 * optimistic-todo-list-cache.ts, kept separate so it's testable without a
 * tRPC context.
 */
export function useOptimisticTodoListMutation<TVariables extends { id: number }, TData>(
  baseOptions: UseMutationOptions<TData, TRPCClientErrorLike<AppRouter>, TVariables>,
  updateList: (todos: TodoListItem[] | undefined, variables: TVariables) => TodoListItem[] | undefined,
) {
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
}
