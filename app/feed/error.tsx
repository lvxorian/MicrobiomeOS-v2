"use client";

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[2px] text-red mb-2">
        Chyba
      </div>
      <h2 className="font-heading text-xl font-semibold text-text mb-2">
        Nepodařilo se načíst studie
      </h2>
      <p className="text-text-secondary text-sm mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-teal text-background font-mono text-xs font-medium hover:bg-teal-dim"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
