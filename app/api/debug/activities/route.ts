import { NextResponse, type NextRequest } from "next/server";
import { fetchActivities, getValidAccessToken } from "@/lib/strava";

// Dev-only check for step 3: compare these totals with your Strava profile.
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const auth = await getValidAccessToken();
  if (!auth) return NextResponse.json({ error: "not logged in" }, { status: 401 });

  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const runs = await fetchActivities(auth.accessToken, year);
  const km = runs.reduce((s, r) => s + r.distance, 0) / 1000;
  const hours = runs.reduce((s, r) => s + r.moving_time, 0) / 3600;
  console.log(`[strava] ${year}: ${runs.length} runs, ${km.toFixed(1)} km`);
  return NextResponse.json({
    year,
    runs: runs.length,
    totalKm: Number(km.toFixed(2)),
    movingHours: Number(hours.toFixed(1)),
    elevationGainM: Math.round(runs.reduce((s, r) => s + r.total_elevation_gain, 0)),
  });
}
