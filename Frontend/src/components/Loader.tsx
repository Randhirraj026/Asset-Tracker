export function Loader() {
  return <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />;
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="glass-panel h-28 animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}
