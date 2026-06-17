import { cn } from "@/lib/utils";

type EvidenceScoreProps = {
  score: number;
  className?: string;
};

export function EvidenceScore({ score, className }: EvidenceScoreProps) {
  const displayScore = score.toFixed(1).replace(".", ",");
  const pct = (score / 10) * 100;

  const color =
    score >= 8 ? "text-teal" : score >= 6 ? "text-amber" : "text-red";

  const glowColor =
    score >= 8
      ? "rgba(0,212,170,0.4)"
      : score >= 6
        ? "rgba(245,166,35,0.3)"
        : "rgba(255,77,106,0.3)";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span
        className={cn("font-heading text-5xl font-bold tracking-[-0.5px]", color)}
        style={{ textShadow: `0 0 20px ${glowColor}` }}
      >
        {displayScore}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-text3 mt-1">
        / 10
      </span>
      <span className="font-mono text-[10px] text-text-secondary mt-3">
        Skóre důkazů
      </span>
      <div className="w-full h-1 rounded-full bg-bg3 mt-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color.replace("text", "bg"))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
