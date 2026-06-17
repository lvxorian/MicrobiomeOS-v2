export default function FeedLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-bg3 rounded mb-2" />
      <div className="h-4 w-72 bg-bg3 rounded mb-6" />
      <div className="flex flex-wrap gap-1.5 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-5 w-20 bg-bg3 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="h-12 bg-bg3 rounded mb-3" />
            <div className="h-4 w-24 bg-bg3 rounded mb-2" />
            <div className="h-5 bg-bg3 rounded mb-1" />
            <div className="h-4 bg-bg3 rounded mb-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
