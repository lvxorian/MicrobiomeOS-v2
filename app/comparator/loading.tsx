export default function ComparatorLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-36 bg-bg3 rounded mb-2" />
      <div className="h-4 w-80 bg-bg3 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5 h-48" />
        ))}
      </div>
    </div>
  );
}
