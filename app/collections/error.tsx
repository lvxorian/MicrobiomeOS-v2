"use client";

export default function CollectionsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[2px] text-red mb-2">
        Chyba
      </div>
      <h2 className="font-heading text-xl font-semibold text-text mb-2">
        Nepodařilo se načíst kolekce
      </h2>
      <p className="text-text-secondary text-sm mb-6 max-w-md">
        Při načítání kolekcí došlo k chybě. Zkuste to prosím znovu.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-teal text-background font-mono text-xs font-medium hover:bg-teal-dim transition-colors"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
