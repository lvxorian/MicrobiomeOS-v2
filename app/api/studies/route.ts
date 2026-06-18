import { NextRequest, NextResponse } from "next/server";
import { getStudiesList } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const tag = searchParams.get("tag") || undefined;
  const source = searchParams.get("source") || undefined;
  const minEvidence = searchParams.get("minEvidence") ? parseFloat(searchParams.get("minEvidence")!) : undefined;
  const search = searchParams.get("search") || undefined;
  const isNew = searchParams.get("isNew") === "true";

  const data = await getStudiesList({ page, limit, tag, source, minEvidence, search, isNew });
  return NextResponse.json(data);
}
