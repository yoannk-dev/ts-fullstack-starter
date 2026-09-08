import Link from "next/link";
import type { TodoListItem } from "@/lib/hooks/use-optimistic-todo-list-mutation";
import {
  PRIORITY_LABELS,
  PRIORITY_TEXT_CLASSES,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatDueDate,
} from "../todos/_lib/display";

export function TodoRow({
  todo,
  onCycleStatus,
  onRequestDelete,
}: {
  todo: TodoListItem;
  onCycleStatus: (todo: TodoListItem) => void;
  onRequestDelete: (id: number) => void;
}) {
  return (
    <li className="group bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-400 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/todos/${String(todo.id)}`}
            className="font-semibold text-gray-900 group-hover:text-black hover:underline truncate block"
          >
            {todo.title}
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => {
                onCycleStatus(todo);
              }}
              aria-label={`Status: ${STATUS_LABELS[todo.status]}. Click to advance to the next status.`}
              className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-75 transition ${STATUS_BADGE_CLASSES[todo.status]}`}
            >
              {STATUS_LABELS[todo.status]}
            </button>
            <span className={`text-xs font-medium ${PRIORITY_TEXT_CLASSES[todo.priority]}`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
            <span className="text-xs text-gray-500">{formatDueDate(todo.dueDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-0.5">
          <Link
            href={`/todos/${String(todo.id)}/edit`}
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
}
