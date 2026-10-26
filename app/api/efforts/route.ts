import { NextResponse, type NextRequest } from "next/server";
import { cached } from "@/lib/cache";
import { effortCandidates, pickBestEfforts } from "@/lib/efforts";
import { fetchActivityDetails, getRuns, getValidAccessToken, RATE_LIMITED_MESSAGE, StravaError } from "@/lib/strava";

export async function GET(req: NextRequest) {
  const auth = await getValidAccessToken();
  if (!auth) return NextResponse.json({ error: "not logged in" }, { status: 401 });

  const year = Number(req.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const id = auth.session.athleteId;
  try {
    const result = await cached(`efforts:${id}:${year}`, 60 * 60 * 1000, async () => {
      const runs = await getRuns(auth.accessToken, id, year);
      const { details, partial } = await fetchActivityDetails(auth.accessToken, effortCandidates(runs).map((r) => r.id));
      if (partial && details.length === 0) throw new StravaError(429);
      return { efforts: pickBestEfforts(details), checked: details.length, partial };
    });
    return NextResponse.json(result);
  } catch (e) {
    const limited = e instanceof StravaError && e.status === 429;
    return NextResponse.json(
      { error: limited ? RATE_LIMITED_MESSAGE : "Couldn't load best efforts" },
      { status: limited ? 429 : 502 },
    );
  }
}
