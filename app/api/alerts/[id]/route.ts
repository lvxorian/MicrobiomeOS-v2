import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { name, keywords, minEvidence, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (keywords !== undefined) data.keywords = JSON.stringify(keywords);
  if (minEvidence !== undefined) data.minEvidence = minEvidence;
  if (isActive !== undefined) data.isActive = isActive;

  try {
    const alert = await prisma.alert.update({
      where: { id: params.id },
      data,
      include: {
        matches: {
          include: { study: { select: { id: true, title: true } } },
          orderBy: { matchedAt: "desc" },
          take: 5,
        },
      },
    });
    return NextResponse.json(alert);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Alert nenalezen" }, { status: 404 });
    }
    return NextResponse.json({ error: "Chyba při aktualizaci upozornění" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.alert.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Alert nenalezen" }, { status: 404 });
    }
    return NextResponse.json({ error: "Chyba při mazání upozornění" }, { status: 500 });
  }
}
