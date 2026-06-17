export default function AgentLoading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-bg3 rounded mb-2" />
      <div className="h-4 w-96 bg-bg3 rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 h-28" />
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg h-80" />
    </div>
  );
}
