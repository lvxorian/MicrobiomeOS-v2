"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Loader2 } from "lucide-react";
import type { LogLine } from "@/types";
import { cn } from "@/lib/utils";
import { DNALoader } from "./DNALoader";
import { playScanStart, playScanComplete, playScanError } from "@/lib/audio";

const TYPE_COLORS: Record<string, string> = {
  INFO: "text-text3",
  FETCH: "text-purple",
  PARSE: "text-amber",
  STORE: "text-teal",
  ALERT: "text-red",
  ERROR: "text-red",
};

export function AgentMonitor() {
  const [runId, setRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("idle");
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [stats, setStats] = useState({ studiesFound: 0, studiesNew: 0, alertsFired: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef<string | null>(null); // track which sound was played

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchRun = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/agent/run/${id}`);
      const data = await res.json();
      if (data.error) return false;

      const lines: LogLine[] = typeof data.logLines === "string" ? JSON.parse(data.logLines) : data.logLines;
      setLogLines(lines);
      setStatus(data.status);
      setStats({
        studiesFound: data.studiesFound || 0,
        studiesNew: data.studiesNew || 0,
        alertsFired: data.alertsFired || 0,
      });
      setErrorMsg(data.errorMsg || null);
      if (data.startedAt) setStartedAt(data.startedAt);

      if (data.status === "SUCCESS" || data.status === "FAILED") {
        stopPolling();
        sessionStorage.removeItem("agentRunId");
        // Play completion sound once
        if (playedRef.current !== data.status) {
          playedRef.current = data.status;
          if (data.status === "SUCCESS") playScanComplete();
          else playScanError();
        }
      }
      return true;
    } catch {
      return false;
    }
  }, [stopPolling]);

  const startPolling = useCallback((id: string) => {
    stopPolling();
    sessionStorage.setItem("agentRunId", id);
    pollRef.current = setInterval(() => {
      fetchRun(id);
    }, 1500);
  }, [stopPolling, fetchRun]);

  // Při mountu: zkontroluj, jestli neběží agent z předchozí návštěvy
  useEffect(() => {
    const savedRunId = sessionStorage.getItem("agentRunId");
    if (savedRunId) {
      // Ověř, že run pořád běží
      fetch(`/api/agent/run/${savedRunId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status === "RUNNING") {
            setRunId(savedRunId);
            setStatus("RUNNING");
            startPolling(savedRunId);
          } else {
            // Už doběhl — načti data a ukaž výsledek
            sessionStorage.removeItem("agentRunId");
            setRunId(savedRunId);
            fetchRun(savedRunId);
          }
        })
        .catch(() => {
          sessionStorage.removeItem("agentRunId");
        });
    }
    return () => stopPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Auto-scroll pouze během aktivního runu, ne při prvním načtení stránky
    if (logLines.length > 0 && status === "RUNNING") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logLines, status]);

  const handleRun = async () => {
    setLoading(true);
    setLogLines([]);
    setStatus("RUNNING");
    playScanStart();
    setStats({ studiesFound: 0, studiesNew: 0, alertsFired: 0 });
    setErrorMsg(null);
    playedRef.current = null; // reset for new run
    try {
      const res = await fetch("/api/agent/run", { method: "POST" });
      const data = await res.json();
      if (data.runId) {
        setRunId(data.runId);
        setStartedAt(new Date().toISOString());
        startPolling(data.runId);
      }
    } catch {
      setStatus("FAILED");
      setErrorMsg("Nepodařilo se spustit agenta");
    }
    setLoading(false);
  };

  const nextRun = (() => {
    const now = new Date();
    const pragueNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Prague" }));
    const pragueOffset = pragueNow.getTime() - now.getTime();
    const next = new Date(now.getTime() - pragueOffset);
    next.setHours(5, 0, 0, 0);
    if (next.getTime() + pragueOffset <= now.getTime()) next.setDate(next.getDate() + 1);
    return new Date(next.getTime() + pragueOffset).toISOString();
  })();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text3">
          Poslední běh
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text3">
            Příští sken: {new Date(nextRun).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={handleRun}
            disabled={loading || status === "RUNNING"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal text-background font-mono text-[10px] font-medium hover:bg-teal-dim disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : status === "RUNNING" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {loading ? "Spouštím..." : status === "RUNNING" ? "Běží..." : "Spustit nyní"}
          </button>
        </div>
      </div>

      {/* Log */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-bg3/50">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "RUNNING" ? "bg-teal animate-pulse" : status === "SUCCESS" ? "bg-teal" : status === "FAILED" ? "bg-red" : "bg-text3"
              )}
            />
            <span className="font-mono text-[10px] uppercase tracking-[1px] text-text-secondary">
              {status === "RUNNING" ? "Aktivní" : status === "SUCCESS" ? "Dokončeno" : status === "FAILED" ? "Chyba" : "Nečinný"}
            </span>
          </div>
          {startedAt && (
            <span className="font-mono text-[10px] text-text3">
              {new Date(startedAt).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <div className="ml-auto flex items-center gap-3 font-mono text-[10px] text-text3">
            <span>{stats.studiesFound} nalezeno</span>
            <span className="text-teal">+{stats.studiesNew} nově</span>
            <span className="text-amber">{stats.alertsFired} upozornění</span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-3 font-mono text-xs leading-relaxed space-y-1">
          {logLines.length === 0 && status === "RUNNING" && (
            <div className="flex items-center justify-center py-8">
              <DNALoader />
            </div>
          )}
          {logLines.length === 0 && status === "idle" && (
            <div className="text-center py-8 text-text3">
              <p className="font-mono text-xs">Klikněte na &quot;Spustit nyní&quot; pro manuální spuštění agenta</p>
            </div>
          )}
          {logLines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-text3 shrink-0">
                {new Date(line.timestamp).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className={cn("shrink-0 uppercase tracking-[0.5px] text-[10px]", TYPE_COLORS[line.type] || "text-text3")}>
                {line.type}
              </span>
              <span className="text-text-secondary break-all">{line.message}</span>
            </div>
          ))}
          {status === "RUNNING" && logLines.length > 0 && (
            <DNALoader className="pt-1" />
          )}
          <div ref={logEndRef} />
        </div>

        {errorMsg && (
          <div className="px-4 py-2 border-t border-red/20 bg-red/5">
            <span className="font-mono text-[10px] text-red">{errorMsg}</span>
          </div>
        )}
      </div>

      {status === "SUCCESS" && runId && (
        <div className="mt-3 text-center">
          <span className="font-mono text-[10px] text-teal">
            Hotovo — {stats.studiesNew} nových studií indexováno
          </span>
        </div>
      )}
    </div>
  );
}
