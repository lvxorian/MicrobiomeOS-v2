import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const alerts = await prisma.alert.findMany({
    include: {
      matches: {
        include: { study: { select: { id: true, title: true } } },
        orderBy: { matchedAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, keywords, minEvidence } = body;

  if (!name || !keywords || keywords.length === 0) {
    return NextResponse.json({ error: "Název a klíčová slova jsou povinná" }, { status: 400 });
  }

  const alert = await prisma.alert.create({
    data: {
      name,
      keywords: JSON.stringify(keywords),
      minEvidence: minEvidence || 0,
      isActive: true,
      userId: "seed-user",
    },
    include: {
      matches: {
        include: { study: { select: { id: true, title: true } } },
        orderBy: { matchedAt: "desc" },
        take: 5,
      },
    },
  });

  return NextResponse.json(alert);
}
