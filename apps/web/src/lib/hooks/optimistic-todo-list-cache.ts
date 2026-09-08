import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { AppRouter } from "@repo/api/router";
import type { inferRouterOutputs } from "@trpc/server";

export type TodoListItem = inferRouterOutputs<AppRouter>["todo"]["findAll"][number];

export interface OptimisticContext {
  previous: TodoListItem[] | undefined;
}

/**
 * Snapshots the current todo list, then applies `updateList` immediately.
 * Split out from the mutation hook itself so the actual cache transition
 * (the risky part — get this wrong and a failed mutation leaves the UI
 * showing data that was never saved) can be unit-tested against a plain
 * QueryClient, with no tRPC/network involved.
 */
export function applyOptimisticUpdate<TVariables>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updateList: (todos: TodoListItem[] | undefined, variables: TVariables) => TodoListItem[] | undefined,
  variables: TVariables,
): OptimisticContext {
  const previous = queryClient.getQueryData<TodoListItem[]>(queryKey);
  queryClient.setQueryData<TodoListItem[]>(queryKey, (old) => updateList(old, variables));
  return { previous };
}

/** Restores the pre-mutation snapshot captured by applyOptimisticUpdate. */
export function rollbackOptimisticUpdate(
  queryClient: QueryClient,
  queryKey: QueryKey,
  context: OptimisticContext | undefined,
): void {
  if (context?.previous) {
    queryClient.setQueryData(queryKey, context.previous);
  }
}
