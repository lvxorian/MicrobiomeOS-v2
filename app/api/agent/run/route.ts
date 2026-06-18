import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runAgent } from "@/lib/agent";
import { getAgentRuns } from "@/lib/db/queries";
import { getNextRun } from "@/lib/agent/scheduler";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const run = await prisma.agentRun.create({
      data: { status: "RUNNING", logLines: "[]", studiesFound: 0, studiesNew: 0, alertsFired: 0 },
    });

    runAgent(undefined, run.id).catch(console.error);

    return NextResponse.json({ runId: run.id });
  } catch {
    return NextResponse.json({ error: "Chyba při spouštění agenta" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const runs = await getAgentRuns(5);
    const nextRun = getNextRun();
    return NextResponse.json({ runs, nextRun, active: true });
  } catch {
    return NextResponse.json({ error: "Chyba při načítání historie agenta" }, { status: 500 });
  }
}
