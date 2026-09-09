import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient, serverTrpc } from "@/api/trpc/server";
import { TodoDetail } from "@/components/todos/todo-detail";

type PageProps = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params;
  try {
    const todo = await getServerQueryClient().fetchQuery(
      serverTrpc.todo.findById.queryOptions({ id: Number(id) }),
    );
    return { title: `${todo.title} — Todos` };
  } catch {
    return { title: "Todo not found — Todos" };
  }
};

const TodoDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const todoId = Number(id);

  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery(serverTrpc.todo.findById.queryOptions({ id: todoId }));

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Todo details</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TodoDetail todoId={todoId} />
      </HydrationBoundary>
    </>
  );
};

export default TodoDetailPage;
