import { NextResponse } from "next/server";
import { getTaxaWithStudyCounts, getTaxonEdges } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [taxa, edges] = await Promise.all([getTaxaWithStudyCounts(), getTaxonEdges()]);
    return NextResponse.json({ taxa, edges });
  } catch {
    return NextResponse.json({ error: "Chyba při načítání taxonů" }, { status: 500 });
  }
}
