"use client";

import { cn } from "@/lib/utils";

type ScheduleCardProps = {
  name: string;
  query: string;
  status?: string;
};

export function ScheduleCard({ name, query, status = "ok" }: ScheduleCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading text-sm font-semibold text-text">{name}</span>
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "běží" ? "bg-teal animate-pulse" : "bg-teal"
          )}
        />
      </div>
      <span className="block font-mono text-[10px] uppercase tracking-[1px] text-text3 mb-1">
        Dotaz
      </span>
      <span className="block font-mono text-[11px] text-text-secondary mb-3 truncate">
        {query}
      </span>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-text3 uppercase tracking-[1px]">
          denně · 05:00
        </span>
        <span className="font-mono text-[9px] text-teal">{status}</span>
      </div>
    </div>
  );
}
