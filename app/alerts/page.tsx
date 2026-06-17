"use client";

import { useState, useEffect, useCallback } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TagBadge } from "@/components/shared/TagBadge";
import { Bell, Plus, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert, AlertMatch, Study } from "@prisma/client";

type AlertFull = Alert & {
  matches: (AlertMatch & { study: Pick<Study, "id" | "title"> })[];
};

function AlertModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; keywords: string[]; minEvidence: number }) => void;
  initial?: AlertFull;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [kwInput, setKwInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(() => {
    if (!initial) return [];
    try {
      return typeof initial.keywords === "string" ? JSON.parse(initial.keywords) : [];
    } catch {
      return [];
    }
  });
  const [minEvidence, setMinEvidence] = useState(initial?.minEvidence || 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setMinEvidence(initial?.minEvidence || 0);
      try {
        setKeywords(initial ? (typeof initial.keywords === "string" ? JSON.parse(initial.keywords) : []) : []);
      } catch {
        setKeywords([]);
      }
      setKwInput("");
    }
  }, [open, initial]);

  const addKeyword = () => {
    const kw = kwInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKwInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
    if (e.key === "Escape") onClose();
  };

  const handleSave = async () => {
    if (!name.trim() || keywords.length === 0) return;
    setSaving(true);
    await onSave({ name: name.trim(), keywords, minEvidence });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-bg2 border border-border rounded-xl shadow-2xl" onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="font-heading text-sm font-semibold text-text">
            {initial ? "Upravit upozornění" : "Nové upozornění"}
          </span>
          <button onClick={onClose} className="rounded-md p-1 text-text3 hover:text-text hover:bg-card2 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[1px] text-text3 mb-1.5">Název</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Akkermansia + metabolický syndrom"
              className="w-full h-9 px-3 rounded-md bg-bg3 border border-border text-text text-sm placeholder:text-text3 focus:border-teal/40 outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[1px] text-text3 mb-1.5">Klíčová slova</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Zadejte klíčové slovo..."
                className="flex-1 h-9 px-3 rounded-md bg-bg3 border border-border text-text text-sm placeholder:text-text3 focus:border-teal/40 outline-none transition-colors"
              />
              <button
                onClick={addKeyword}
                className="px-3 h-9 rounded-md bg-teal text-background font-mono text-[10px] font-medium hover:bg-teal-dim transition-colors"
              >
                Přidat
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple/10 border border-purple/15 font-mono text-[9px] text-purple"
                >
                  {kw}
                  <button
                    onClick={() => setKeywords(keywords.filter((k) => k !== kw))}
                    className="hover:text-red transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              {keywords.length === 0 && (
                <span className="font-mono text-[9px] text-text3">Zatím žádná klíčová slova</span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[1px] text-text3 mb-1.5">
              Minimální skóre důkazů
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minEvidence}
              onChange={(e) => setMinEvidence(parseFloat(e.target.value))}
              className="w-full accent-teal"
            />
            <span className="block text-center font-mono text-[10px] text-teal mt-1">
              {minEvidence.toFixed(1).replace(".", ",")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md border border-border text-text-secondary font-mono text-[10px] hover:bg-card2 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || keywords.length === 0 || saving}
            className="flex-1 h-9 rounded-md bg-teal text-background font-mono text-[10px] font-medium hover:bg-teal-dim disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            {initial ? "Uložit" : "Vytvořit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AlertFull | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleToggle = async (alert: AlertFull) => {
    try {
      await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !alert.isActive }),
      });
      fetchAlerts();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat toto upozornění?")) return;
    try {
      await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      fetchAlerts();
    } catch {
      // ignore
    }
  };

  const handleSave = async (data: { name: string; keywords: string[]; minEvidence: number }) => {
    if (editing) {
      await fetch(`/api/alerts/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    fetchAlerts();
  };

  const unseenCount = alerts.reduce(
    (sum, a) => sum + a.matches.filter((m) => !m.seen).length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Automatické notifikace"
        title="Chytré upozornění"
        description="Nastavte si vlastní alerty na klíčová slova. Když agent naindexuje studii odpovídající vašemu alertu, zobrazí se zde."
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text3">
            {alerts.length} {alerts.length === 1 ? "alert" : alerts.length < 5 ? "alerty" : "alertů"}
          </span>
          {unseenCount > 0 && (
            <span className="font-mono text-[10px] text-amber">
              {unseenCount} nepřečtených shod
            </span>
          )}
        </div>
        <button
          onClick={() => { setEditing(null); setCreating(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal text-background font-mono text-[10px] font-medium hover:bg-teal-dim transition-colors"
        >
          <Plus className="h-3 w-3" />
          Nové upozornění
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-24 text-text3">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono text-sm">Žádná upozornění</p>
          <p className="text-text3 text-xs mt-1">Vytvořte si první alert</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const keywords: string[] = (() => {
              try { return typeof alert.keywords === "string" ? JSON.parse(alert.keywords) : []; } catch { return []; }
            })();
            const unseenMatches = alert.matches.filter((m) => !m.seen);
            return (
              <div key={alert.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-semibold text-text mb-1">{alert.name}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw: string) => (
                          <TagBadge key={kw} label={kw} color="purple" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => { setEditing(alert); setCreating(true); }}
                        className="p-1.5 rounded text-text3 hover:text-text hover:bg-card2 transition-colors"
                        title="Upravit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-1.5 rounded text-text3 hover:text-red hover:bg-red/10 transition-colors"
                        title="Smazat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(alert)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                          alert.isActive ? "bg-teal" : "bg-bg3 border-border"
                        )}
                        title={alert.isActive ? "Deaktivovat" : "Aktivovat"}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition-transform",
                            alert.isActive ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-[10px] text-text3">
                    <span>Min. skóre: {alert.minEvidence.toFixed(1).replace(".", ",")}</span>
                    <span className={alert.isActive ? "text-teal" : "text-text3"}>
                      {alert.isActive ? "aktivní" : "neaktivní"}
                    </span>
                    {alert.lastTriggered && (
                      <span>
                        Naposledy: {new Date(alert.lastTriggered).toLocaleDateString("cs-CZ")}
                      </span>
                    )}
                  </div>
                </div>

                {alert.matches.length > 0 && (
                  <div className="border-t border-border px-5 py-3 bg-bg3/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] uppercase tracking-[1px] text-text3">
                        Poslední shody ({alert.matches.length})
                      </span>
                      {unseenMatches.length > 0 && (
                        <span className="font-mono text-[9px] text-amber">
                          {unseenMatches.length} nových
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {alert.matches.map((match) => (
                        <div key={match.id} className="flex items-center gap-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", match.seen ? "bg-text3" : "bg-teal animate-pulse")} />
                          <a
                            href={`/study/${match.studyId}`}
                            className="font-mono text-[11px] text-text-secondary hover:text-teal truncate transition-colors"
                          >
                            {match.study.title}
                          </a>
                          <span className="font-mono text-[9px] text-text3 ml-auto shrink-0">
                            {new Date(match.matchedAt).toLocaleDateString("cs-CZ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertModal
        open={creating}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing || undefined}
      />
    </div>
  );
}
