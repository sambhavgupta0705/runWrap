import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Same-origin proxy for the athlete's photo so share-card export isn't blocked by CORS.
export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse(null, { status: 401 });
  const res = await fetch(session.profile, { cache: "no-store" });
  if (!res.ok) return new NextResponse(null, { status: 502 });
  return new NextResponse(await res.arrayBuffer(), {
    headers: { "Content-Type": res.headers.get("content-type") ?? "image/jpeg", "Cache-Control": "private, max-age=3600" },
  });
}
