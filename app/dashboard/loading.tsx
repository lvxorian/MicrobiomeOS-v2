export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-bg3 rounded mb-2" />
      <div className="h-4 w-96 bg-bg3 rounded mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="h-3 w-24 bg-bg3 rounded mb-2" />
            <div className="h-7 w-16 bg-bg3 rounded" />
          </div>
        ))}
      </div>

      <div className="h-5 w-64 bg-bg3 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="h-12 bg-bg3 rounded mb-3" />
            <div className="h-4 w-32 bg-bg3 rounded mb-2" />
            <div className="h-5 bg-bg3 rounded mb-1 w-full" />
            <div className="h-4 bg-bg3 rounded mb-3 w-3/4" />
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 w-16 bg-bg3 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
