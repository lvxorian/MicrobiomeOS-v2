import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runAgent } from "@/lib/agent";
import { getAgentRuns } from "@/lib/db/queries";
import { getNextRun } from "@/lib/agent/scheduler";

export async function POST() {
  // Vytvořit záznam runu napřed, abychom měli runId hned
  const run = await prisma.agentRun.create({
    data: { status: "RUNNING", logLines: "[]", studiesFound: 0, studiesNew: 0, alertsFired: 0 },
  });

  // Spustit agenta asynchronně s existujícím runId
  runAgent(undefined, run.id).catch(console.error);

  return NextResponse.json({ runId: run.id });
}

export async function GET() {
  const runs = await getAgentRuns(5);
  const nextRun = getNextRun();
  return NextResponse.json({ runs, nextRun, active: true });
}
