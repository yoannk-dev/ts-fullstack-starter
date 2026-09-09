import Link from "next/link";
import type { TodoListItem } from "@/hooks/todos/use-optimistic-todo-list-mutation";
import {
  PRIORITY_LABELS,
  PRIORITY_TEXT_CLASSES,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/services/todos/todo-display";
import { formatDueDate } from "@/utils/date";
import { todoRoutes } from "@/routing/paths";

export const TodoRow = ({
  todo,
  onRequestDelete,
}: {
  todo: TodoListItem;
  onRequestDelete: (id: number) => void;
}) => {
  return (
    <li className="group bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={todoRoutes.detail(todo.id)}
            className="font-semibold text-gray-900 group-hover:text-black hover:underline truncate block"
          >
            {todo.title}
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[todo.status]}`}
            >
              {STATUS_LABELS[todo.status]}
            </span>
            <span className={`text-xs font-medium ${PRIORITY_TEXT_CLASSES[todo.priority]}`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
            <span className="text-xs text-gray-500">{formatDueDate(todo.dueDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-0.5">
          <Link
            href={todoRoutes.edit(todo.id)}
            aria-label={`Edit "${todo.title}"`}
            className="text-xs font-medium text-gray-600 hover:text-gray-700 transition-colors"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => {
              onRequestDelete(todo.id);
            }}
            aria-label={`Delete "${todo.title}"`}
            className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};
