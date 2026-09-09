import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient, serverTrpc } from "@/api/trpc/server";
import { TodoList } from "@/components/todos/todo-list";

export const dynamic = "force-dynamic";

const Home = async () => {
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery(serverTrpc.todo.findAll.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoList />
    </HydrationBoundary>
  );
};

export default Home;
