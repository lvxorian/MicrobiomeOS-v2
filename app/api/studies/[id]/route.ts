import { NextRequest, NextResponse } from "next/server";
import { getStudyById } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const study = await getStudyById(params.id);
  if (!study) {
    return NextResponse.json({ error: "Studie nenalezena" }, { status: 404 });
  }
  return NextResponse.json(study);
}
