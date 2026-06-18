import { NextResponse } from "next/server";
import { getTaxaWithStudyCounts, getTaxonEdges } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const [taxa, edges] = await Promise.all([getTaxaWithStudyCounts(), getTaxonEdges()]);
  return NextResponse.json({ taxa, edges });
}
