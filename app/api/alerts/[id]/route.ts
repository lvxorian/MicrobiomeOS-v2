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
  } catch {
    return NextResponse.json({ error: "Alert nenalezen" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.alert.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Alert nenalezen" }, { status: 404 });
  }
}
