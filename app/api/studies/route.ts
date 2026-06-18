import { NextRequest, NextResponse } from "next/server";
import { getStudiesList } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPage = parseInt(searchParams.get("page") || "1");
    const rawLimit = parseInt(searchParams.get("limit") || "20");
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : rawLimit;
    const tag = searchParams.get("tag") || undefined;
    const source = searchParams.get("source") || undefined;
    const minEvidence = searchParams.get("minEvidence") ? parseFloat(searchParams.get("minEvidence")!) : undefined;
    const search = searchParams.get("search") || undefined;
    const isNew = searchParams.get("isNew") === "true";

    const data = await getStudiesList({ page, limit, tag, source, minEvidence, search, isNew });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Chyba při načítání studií" }, { status: 500 });
  }
}
