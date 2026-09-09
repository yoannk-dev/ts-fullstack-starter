export const TodoSkeleton = ({
  rows,
  rowHeight = "h-20",
}: {
  rows: number;
  rowHeight?: "h-12" | "h-20" | "h-64";
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={`home-row-${String(i)}`}
        className={`${rowHeight} bg-gray-100 rounded-xl animate-pulse`}
      />
    ))}
  </div>
);
