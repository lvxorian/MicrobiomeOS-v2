import { NextResponse } from "next/server";
import { getCollections } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.user?.email || "guest";
    const collections = await getCollections(userId);
    return NextResponse.json(collections);
  } catch {
    return NextResponse.json({ error: "Chyba při načítání kolekcí" }, { status: 500 });
  }
}
