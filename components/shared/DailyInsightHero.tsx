import { Sparkles } from "lucide-react";

type DailyInsightHeroProps = {
  date: string;
  summaryText: string;
  keyFindings: string[];
  studiesCount: number;
  studiesNew: number;
  isToday: boolean;
};

export function DailyInsightHero({
  date,
  summaryText,
  keyFindings,
  studiesCount,
  studiesNew,
  isToday,
}: DailyInsightHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-teal/20 bg-gradient-to-br from-card via-card to-teal/5 mb-8">
      {/* Bioluminescent glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/5 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal via-teal/50 to-transparent" />

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isToday && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/40" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-teal">
              {isToday ? "Live Intelligence" : "Daily Intelligence"}
            </span>
          </div>
          <span className="text-text3">·</span>
          <span className="font-mono text-[10px] text-text3">
            {new Date(date).toLocaleDateString("cs-CZ", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-text-secondary">
            <Sparkles className="h-3 w-3 text-teal" />
            <span className="text-teal">{studiesNew} nových</span>
            <span className="text-text3">/ {studiesCount} skenováno</span>
          </span>
        </div>

        {/* Main insight text */}
        <p className="text-text text-sm leading-relaxed font-medium max-w-4xl">
          {summaryText}
        </p>

        {/* Key findings chips */}
        {keyFindings.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {keyFindings.slice(0, 6).map((finding, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal/5 border border-teal/10 font-mono text-[9px] text-text-secondary"
              >
                <span className="h-1 w-1 rounded-full bg-teal" />
                {finding}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
