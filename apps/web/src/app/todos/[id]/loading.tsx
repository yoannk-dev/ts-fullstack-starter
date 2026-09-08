import { TodoSkeleton } from "../../_components/todo-skeleton";

export default function Loading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Todo details</h1>
      </div>
      <TodoSkeleton rows={4} rowHeight="h-12" />
    </main>
  );
}
