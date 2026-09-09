import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { AppRouter } from "@repo/api/router";
import type { inferRouterOutputs } from "@trpc/server";

export type TodoListItem = inferRouterOutputs<AppRouter>["todo"]["findAll"][number];

export interface OptimisticContext {
  previous: TodoListItem[] | undefined;
}

export const applyOptimisticUpdate = <TVariables>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updateList: (
    todos: TodoListItem[] | undefined,
    variables: TVariables,
  ) => TodoListItem[] | undefined,
  variables: TVariables,
): OptimisticContext => {
  const previous = queryClient.getQueryData<TodoListItem[]>(queryKey);
  queryClient.setQueryData<TodoListItem[]>(queryKey, (old) => updateList(old, variables));
  return { previous };
};

export const rollbackOptimisticUpdate = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  context: OptimisticContext | undefined,
): void => {
  if (context?.previous) {
    queryClient.setQueryData(queryKey, context.previous);
  }
};
