import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const run = await prisma.agentRun.findUnique({ where: { id: params.id } });
  if (!run) {
    return NextResponse.json({ error: "Run nenalezen" }, { status: 404 });
  }
  return NextResponse.json(run);
}
