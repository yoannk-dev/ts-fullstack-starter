import type { Priority, Status } from "@repo/types";

export const NEXT_STATUS: Record<Status, Status> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

export const STATUS_LABELS: Record<Status, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const STATUS_BADGE_CLASSES: Record<Status, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

export const PRIORITY_LABELS: Record<Priority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
export const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
export const PRIORITY_TEXT_CLASSES: Record<Priority, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600",
};

// Locale is pinned rather than left to the runtime default: the server
// (Node, host locale) and the browser (its own locale) can disagree, and
// since page.tsx now renders this on the server, a mismatch there is a
// hydration error, not just a cosmetic inconsistency.
const DATE_LOCALE = "en-US";

export function formatDueDate(dueDate: Date | string | null) {
  if (!dueDate) return "No due date";
  return new Date(dueDate).toLocaleDateString(DATE_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString(DATE_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
