import type { ReactNode } from "react";
import { TodoSkeleton } from "@/components/todo-skeleton";

interface TodoQueryStateProps<T> {
  isLoading: boolean;
  isNotFound: boolean;
  error: unknown;
  data: T | undefined;
  children: (data: T) => ReactNode;
}

export const TodoQueryState = <T,>({
  isLoading,
  isNotFound,
  error,
  data,
  children,
}: TodoQueryStateProps<T>) => {
  if (isLoading) {
    return <TodoSkeleton rows={1} rowHeight="h-64" />;
  }
  if (isNotFound) {
    return <p className="text-sm text-gray-500">This todo could not be found.</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-600">
        Something went wrong loading this todo. Please try again.
      </p>
    );
  }
  if (!data) {
    return null;
  }
  return <>{children(data)}</>;
};
