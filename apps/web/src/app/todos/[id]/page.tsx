import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient, serverTrpc } from "@/lib/trpc/server";
import { BackButton } from "../_components/back-button";
import { TodoDetail } from "./_components/todo-detail";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const todo = await getServerQueryClient().fetchQuery(
      serverTrpc.todo.findById.queryOptions({ id: Number(id) }),
    );
    return { title: `${todo.title} — Todos` };
  } catch {
    return { title: "Todo not found — Todos" };
  }
}

export default async function TodoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const todoId = Number(id);

  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery(serverTrpc.todo.findById.queryOptions({ id: todoId }));

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <BackButton />
        <h1 className="text-3xl font-bold tracking-tight">Todo details</h1>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TodoDetail todoId={todoId} />
      </HydrationBoundary>
    </main>
  );
}
