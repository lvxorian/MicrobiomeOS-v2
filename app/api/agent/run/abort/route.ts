import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const running = await prisma.agentRun.findFirst({
      where: { status: "RUNNING" },
      orderBy: { startedAt: "desc" },
    });

    if (!running) {
      return NextResponse.json({ error: "Žádný aktivní sken neběží" }, { status: 404 });
    }

    await prisma.agentRun.update({
      where: { id: running.id },
      data: { abortRequested: true },
    });

    return NextResponse.json({ aborted: true, runId: running.id });
  } catch {
    return NextResponse.json({ error: "Chyba při přerušování skenu" }, { status: 500 });
  }
}
