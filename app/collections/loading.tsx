export default function CollectionsLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-24 bg-bg3 rounded mb-2" />
      <div className="h-4 w-64 bg-bg3 rounded mb-8" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 h-48" />
        ))}
      </div>
    </div>
  );
}
