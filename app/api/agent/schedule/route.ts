import { NextResponse } from "next/server";
import { getAgentRuns } from "@/lib/db/queries";
import { getNextRun } from "@/lib/agent/scheduler";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = await getAgentRuns(5);
  const nextRun = getNextRun();

  const sources = [
    { key: "PUBMED", name: "PubMed", cadence: "denně", query: "microbiome[Title/Abstract]" },
    { key: "NATURE", name: "Nature", cadence: "denně", query: "microbiome + last 7 days" },
    { key: "CELL", name: "Cell Host & Microbe", cadence: "denně", query: "microbiome" },
    { key: "BIORXIV", name: "bioRxiv", cadence: "denně", query: "microbiome/microbiota" },
    { key: "GUT_BMJ", name: "Gut (BMJ)", cadence: "denně", query: "microbiome" },
  ];

  return NextResponse.json({
    nextRun,
    active: true,
    sources,
    runs,
  });
}
