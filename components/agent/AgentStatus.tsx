"use client";

export function AgentStatus() {
  // V MVP verzi zobrazujeme aktivní stav z AgentRun
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-secondary">
        Agent běží
      </span>
      <span className="ml-auto font-mono text-[10px] text-text3">06:00</span>
    </div>
  );
}
