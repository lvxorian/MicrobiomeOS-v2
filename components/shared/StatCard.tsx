import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
};

export function StatCard({ label, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 flex flex-col gap-1",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
          {label}
        </span>
        <span className="text-teal">{icon}</span>
      </div>
      <span className="font-heading text-2xl font-semibold tracking-[-0.3px] text-text">
        {value}
      </span>
      {trend && (
        <span
          className={cn(
            "font-mono text-[10px]",
            trendUp === true && "text-teal",
            trendUp === false && "text-red",
            trendUp === undefined && "text-text-secondary"
          )}
        >
          {trend}
        </span>
      )}
    </div>
  );
}
