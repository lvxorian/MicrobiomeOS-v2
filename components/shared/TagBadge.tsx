import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  teal: "bg-teal/10 text-teal border-teal/20",
  purple: "bg-purple/10 text-purple border-purple/20",
  amber: "bg-amber/10 text-amber border-amber/20",
  red: "bg-red/10 text-red border-red/20",
};

type TagBadgeProps = {
  label: string;
  color?: string;
  className?: string;
};

export function TagBadge({ label, color = "teal", className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[9px] font-medium lowercase tracking-[1.5px] px-2 py-0.5 rounded border",
        colorMap[color] || colorMap.teal,
        className
      )}
    >
      {label}
    </span>
  );
}
