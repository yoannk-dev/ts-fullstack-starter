import { TodoSkeleton } from "@/components/todo-skeleton";

const Loading = () => (
  <>
    <h1 className="text-3xl font-bold tracking-tight mb-8">Todo details</h1>
    <TodoSkeleton rows={1} rowHeight="h-64" />
  </>
);

export default Loading;
