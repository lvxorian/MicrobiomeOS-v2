"use client";

import { cn } from "@/lib/utils";
import type { LogLine } from "@/types";

const TYPE_COLORS: Record<string, string> = {
  INFO: "text-text3",
  FETCH: "text-purple",
  PARSE: "text-amber",
  STORE: "text-teal",
  ALERT: "text-red",
  ERROR: "text-red",
};

type AgentLogProps = {
  logLines: LogLine[];
  status: string;
  startedAt: string;
  studiesFound: number;
  studiesNew: number;
  alertsFired: number;
  errorMsg: string | null;
};

export function AgentLog({
  logLines,
  status,
  startedAt,
  studiesFound,
  studiesNew,
  alertsFired,
  errorMsg,
}: AgentLogProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-bg3/50">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status === "RUNNING" ? "bg-teal animate-pulse" : status === "SUCCESS" ? "bg-teal" : "bg-red"
            )}
          />
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-text-secondary">
            {status === "RUNNING" ? "Aktivní" : status === "SUCCESS" ? "Dokončeno" : "Chyba"}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text3">
          {new Date(startedAt).toLocaleDateString("cs-CZ", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <div className="ml-auto flex items-center gap-3 font-mono text-[10px] text-text3">
          <span>{studiesFound} nalezeno</span>
          <span className="text-teal">+{studiesNew} nově</span>
          <span className="text-amber">{alertsFired} upozornění</span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-3 font-mono text-xs leading-relaxed space-y-1">
        {logLines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-text3 shrink-0">
              {new Date(line.timestamp).toLocaleTimeString("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span
              className={cn(
                "shrink-0 uppercase tracking-[0.5px] text-[10px]",
                TYPE_COLORS[line.type] || "text-text3"
              )}
            >
              {line.type}
            </span>
            <span className="text-text-secondary truncate">{line.message}</span>
          </div>
        ))}
        {status === "RUNNING" && (
          <div className="flex gap-2 opacity-50">
            <span className="text-text3">...</span>
            <span className="text-teal text-[10px] uppercase">PROBÍHÁ</span>
            <span className="text-text-secondary">Zpracovávám...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="px-4 py-2 border-t border-red/20 bg-red/5">
          <span className="font-mono text-[10px] text-red">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
