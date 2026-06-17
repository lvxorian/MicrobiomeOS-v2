export default function AlertsLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-40 bg-bg3 rounded mb-2" />
      <div className="h-4 w-72 bg-bg3 rounded mb-8" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-5 h-40" />
        ))}
      </div>
    </div>
  );
}
