import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_WORKFLOW_URL =
  "https://api.github.com/repos/lvxorian/MicrobiomeOS-v2/actions/workflows/301133747/dispatches";

export async function GET() {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return NextResponse.json({ error: "GITHUB_PAT not set" }, { status: 500 });
  }

  try {
    const res = await fetch(GITHUB_WORKFLOW_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true, status: res.status });
    }

    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
