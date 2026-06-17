import { getLatestAgentRun, getAgentRuns } from "@/lib/db/queries";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ScheduleCard } from "./ScheduleCard";
import { AgentMonitor } from "./AgentMonitor";

const SOURCES = [
  { key: "PUBMED", name: "PubMed", query: "microbiome[Title/Abstract]" },
  { key: "NATURE", name: "Nature", query: "microbiome + posledních 7 dní" },
  { key: "CELL", name: "Cell Host & Microbe", query: "microbiome v názvu/abstraktu" },
  { key: "BIORXIV", name: "bioRxiv", query: "microbiome/microbiota" },
  { key: "GUT_BMJ", name: "Gut (BMJ)", query: "microbiome" },
];

export default async function AgentPage() {
  const [latestRun, runs] = await Promise.all([
    getLatestAgentRun(),
    getAgentRuns(5),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Monitor agenta"
        title="Monitor agenta"
        description={"Automatická indexace studií z PubMed, Nature, Cell, bioRxiv a Gut.\nAgent běží denně v 06:00."}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SOURCES.map((src) => (
          <ScheduleCard
            key={src.key}
            name={src.name}
            query={src.query}
            status={latestRun?.status === "RUNNING" ? "běží" : "ok"}
          />
        ))}
      </div>

      <AgentMonitor />

      {runs.length > 1 && (
        <div className="mt-8">
          <span className="block font-mono text-[10px] uppercase tracking-[1.5px] text-text3 mb-3">
            Historie běhů
          </span>
          <div className="space-y-2">
            {runs.slice(1).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between bg-bg3 border border-border rounded-md px-4 py-2.5"
              >
                <span className="font-mono text-xs text-text-secondary">
                  {new Date(run.startedAt).toLocaleDateString("cs-CZ", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className={`font-mono text-[10px] ${run.status === "SUCCESS" ? "text-teal" : "text-red"}`}>
                  {run.status === "SUCCESS" ? "úspěch" : run.status === "RUNNING" ? "běží" : "chyba"}
                </span>
                <span className="font-mono text-[10px] text-text3">
                  +{run.studiesNew} nových / {run.studiesFound} nalezeno
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
