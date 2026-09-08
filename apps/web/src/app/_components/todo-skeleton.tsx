export function TodoSkeleton({ rows, rowHeight = "h-20" }: { rows: number; rowHeight?: "h-20" | "h-12" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${rowHeight} bg-gray-100 rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}
