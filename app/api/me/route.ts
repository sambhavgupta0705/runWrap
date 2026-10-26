import { NextResponse, type NextRequest } from "next/server";
import { getValidAccessToken } from "@/lib/strava";

// Dev helper for testing token refresh: /api/me?force=1 forces a refresh.
export async function GET(req: NextRequest) {
  const force =
    process.env.NODE_ENV !== "production" && req.nextUrl.searchParams.has("force");
  const result = await getValidAccessToken({ force });
  if (!result) return NextResponse.json({ error: "not logged in" }, { status: 401 });

  const { session, refreshed } = result;
  return NextResponse.json({
    athleteId: session.athleteId,
    firstname: session.firstname,
    refreshed,
    expiresAt: new Date(session.expiresAt * 1000).toISOString(),
  });
}
