import { TodoSkeleton } from "./_components/todo-skeleton";

export default function Loading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
      </div>
      <TodoSkeleton rows={3} />
    </main>
  );
}
