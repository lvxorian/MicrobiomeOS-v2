import { Sparkles } from "lucide-react";

type KeyFinding = { title: string; studyId?: string };

type DailyInsightHeroProps = {
  date: string;
  summaryText: string;
  keyFindings: KeyFinding[];
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
    <div className="relative overflow-hidden rounded-xl border border-teal/20 bg-gradient-to-br from-card via-card to-teal/5 mb-8 group">
      {/* Bioluminescent glow orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-teal/3 rounded-full blur-2xl pointer-events-none" />

      {/* Hex grid background pattern — microskopický dojem */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,212,170,0.5) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Scanning line effect */}
      {isToday && (
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal/15 to-transparent bio-scan-line pointer-events-none" />
      )}

      {/* Shimmer gloss */}
      {isToday && (
        <div className="absolute inset-0 bio-shimmer pointer-events-none" />
      )}

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal via-teal/50 to-transparent" />

      {/* Floating bioparticles */}
      {isToday && (
        <>
          <div className="absolute top-8 right-12 w-1 h-1 rounded-full bg-teal/40 bio-particle pointer-events-none" style={{ animationDelay: "0s" }} />
          <div className="absolute top-16 right-24 w-1.5 h-1.5 rounded-full bg-teal/30 bio-particle pointer-events-none" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-8 left-16 w-1 h-1 rounded-full bg-purple/30 bio-particle pointer-events-none" style={{ animationDelay: "4s" }} />
          <div className="absolute bottom-12 right-36 w-0.5 h-0.5 rounded-full bg-teal/50 bio-particle pointer-events-none" style={{ animationDelay: "6s" }} />
        </>
      )}

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isToday ? (
                <>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-teal/30 bio-pulse-dot" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
                </>
              ) : (
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-text3" />
              )}
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-[1.5px] ${isToday ? "text-teal" : "text-text3"}`}>
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
        <p className="text-text text-sm leading-relaxed font-medium max-w-4xl relative z-10">
          {summaryText}
        </p>

        {/* Key findings chips */}
        {keyFindings.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 relative z-10">
            {keyFindings.slice(0, 6).map((finding, i) => {
              const chip = (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal/5 border border-teal/10 font-mono text-[9px] text-text-secondary hover:bg-teal/15 hover:border-teal/40 hover:text-teal hover:shadow-[0_0_10px_rgba(0,212,170,0.2)] transition-all duration-300 cursor-pointer"
                >
                  <span className="h-1 w-1 rounded-full bg-teal" />
                  {finding.title}
                </span>
              );
              return finding.studyId ? (
                <a key={i} href={`/study/${finding.studyId}`} className="no-underline">
                  {chip}
                </a>
              ) : (
                chip
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
