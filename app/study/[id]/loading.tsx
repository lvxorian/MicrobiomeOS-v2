export default function StudyDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="h-3 w-48 bg-bg3 rounded mb-3" />
          <div className="h-7 bg-bg3 rounded mb-3 w-full" />
          <div className="h-7 bg-bg3 rounded mb-3 w-2/3" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-16 bg-bg3 rounded" />
            ))}
          </div>
          <div className="h-4 bg-bg3 rounded mb-1" />
          <div className="h-4 bg-bg3 rounded mb-1 w-5/6" />
          <div className="h-4 bg-bg3 rounded mb-1 w-4/6" />
          <div className="h-4 bg-bg3 rounded mb-6 w-3/6" />
          <div className="space-y-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="h-4 bg-bg3 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <aside className="lg:w-72">
          <div className="bg-card border border-border rounded-lg p-6 h-48" />
        </aside>
      </div>
    </div>
  );
}
