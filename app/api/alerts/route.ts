import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    } catch {
      return NextResponse.json({ error: "Chyba při načítání upozornění" }, { status: 500 });
    }
  }
  
  export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, keywords, minEvidence } = body;
  
      if (!name || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return NextResponse.json({ error: "Název a klíčová slova (pole) jsou povinná" }, { status: 400 });
      }
  
      const alert = await prisma.alert.create({
        data: {
          name,
          keywords: JSON.stringify(keywords),
          minEvidence: typeof minEvidence === "number" ? minEvidence : 0,
          isActive: true,
          userId: "guest",
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
    } catch {
    return NextResponse.json({ error: "Chyba při vytváření upozornění" }, { status: 500 });
  }
}
