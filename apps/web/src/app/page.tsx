import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient, serverTrpc } from "@/lib/trpc/server";
import { TodoList } from "./_components/todo-list";

// Todos change on every mutation — without this, Next.js would statically
// prerender this page once at build time and serve that stale snapshot to
// every visitor instead of fetching current data per request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery(serverTrpc.todo.findAll.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoList />
    </HydrationBoundary>
  );
}
