import type { Status } from "@repo/types";
import type { SortKey } from "@/lib/filter-sort-todos";

export function FilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortKey,
  onSortKeyChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: Status | "ALL";
  onStatusFilterChange: (value: Status | "ALL") => void;
  sortKey: SortKey;
  onSortKeyChange: (value: SortKey) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <label className="flex-1">
        <span className="sr-only">Search todos</span>
        <input
          type="search"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          placeholder="Search todos…"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
      </label>

      <label>
        <span className="sr-only">Filter by status</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            onStatusFilterChange(e.target.value as Status | "ALL");
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Sort by</span>
        <select
          value={sortKey}
          onChange={(e) => {
            onSortKeyChange(e.target.value as SortKey);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        >
          <option value="dueDate">Sort by due date</option>
          <option value="priority">Sort by priority</option>
        </select>
      </label>
    </div>
  );
}
