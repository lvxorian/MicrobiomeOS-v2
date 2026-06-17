"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

type MatchItem = {
  id: string;
  matchedAt: string;
  seen: boolean;
  alertName: string;
  studyId: string;
  studyTitle: string;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const fetchMatches = () => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((alerts: Array<{
        name: string;
        matches: Array<{
          id: string;
          matchedAt: string;
          seen: boolean;
          studyId: string;
          study: { title: string };
        }>;
      }>) => {
        const all: MatchItem[] = [];
        for (const a of alerts) {
          for (const m of a.matches) {
            all.push({
              id: m.id,
              matchedAt: m.matchedAt,
              seen: m.seen,
              alertName: a.name,
              studyId: m.studyId,
              studyTitle: m.study.title,
            });
          }
        }
        all.sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime());
        setMatches(all);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markSeen = async (matchId: string) => {
    await fetch(`/api/alerts/matches/${matchId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seen: true }) });
    fetchMatches();
  };

  const unseenCount = matches.filter((m) => !m.seen).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-md p-1.5 text-text3 hover:text-text hover:bg-card2 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unseenCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[8px] font-mono font-bold text-background">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-bg2 border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-secondary">
              Upozornění
            </span>
            {unseenCount > 0 && (
              <span className="font-mono text-[9px] text-amber">{unseenCount} nových</span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {matches.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-6 w-6 mx-auto mb-2 text-text3 opacity-30" />
                <p className="font-mono text-[10px] text-text3">Žádná upozornění</p>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className={`px-3 py-2.5 border-b border-border/50 hover:bg-card2 transition-colors ${!m.seen ? "bg-teal/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${m.seen ? "bg-text3" : "bg-teal"}`} />
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[8px] uppercase tracking-[1px] text-text3 mb-0.5">
                        {m.alertName}
                      </span>
                      <a
                        href={`/study/${m.studyId}`}
                        onClick={() => markSeen(m.id)}
                        className="block font-mono text-[11px] text-text-secondary hover:text-teal leading-snug transition-colors line-clamp-2"
                      >
                        {m.studyTitle}
                      </a>
                      <span className="block font-mono text-[8px] text-text3 mt-1">
                        {new Date(m.matchedAt).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href="/alerts"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-border font-mono text-[10px] text-teal hover:bg-card2 transition-colors"
          >
            Všechna upozornění <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
