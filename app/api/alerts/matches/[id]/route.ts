import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  try {
    const match = await prisma.alertMatch.update({
      where: { id: params.id },
      data: { seen: body.seen === true },
    });
    return NextResponse.json(match);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Shoda nenalezena" }, { status: 404 });
    }
    return NextResponse.json({ error: "Chyba při aktualizaci shody" }, { status: 500 });
  }
}
