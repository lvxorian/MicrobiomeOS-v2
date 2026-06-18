import { NextResponse } from "next/server";
import { getCollections } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  const userId = session?.user?.email || "seed-user";
  const collections = await getCollections(userId);
  return NextResponse.json(collections);
}
