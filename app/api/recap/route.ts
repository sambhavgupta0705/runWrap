import { NextResponse, type NextRequest } from "next/server";
import { getRuns, getValidAccessToken, RATE_LIMITED_MESSAGE, StravaError } from "@/lib/strava";
import { computeRecap } from "@/lib/stats";

export async function GET(req: NextRequest) {
  const auth = await getValidAccessToken();
  if (!auth) return NextResponse.json({ error: "not logged in" }, { status: 401 });

  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  try {
    const runs = await getRuns(auth.accessToken, auth.session.athleteId, year);
    return NextResponse.json({
      athlete: { firstname: auth.session.firstname, profile: auth.session.profile },
      ...computeRecap(runs, year),
    });
  } catch (e) {
    const limited = e instanceof StravaError && e.status === 429;
    return NextResponse.json(
      { error: limited ? RATE_LIMITED_MESSAGE : "Couldn't load activities from Strava" },
      { status: limited ? 429 : 502 },
    );
  }
}
