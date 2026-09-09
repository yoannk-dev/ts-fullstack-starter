const DATE_LOCALE = "en-US";

export const formatDueDate = (dueDate: Date | string | null) => {
  if (!dueDate) return "No due date";
  return new Date(dueDate).toLocaleDateString(DATE_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value: Date | string) => {
  return new Date(value).toLocaleString(DATE_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
