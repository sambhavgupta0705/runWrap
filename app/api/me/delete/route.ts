import { NextResponse } from "next/server";
import { deleteAthleteData } from "@/lib/data";
import { getSession, SESSION_COOKIE } from "@/lib/session";
import { getValidAccessToken } from "@/lib/strava";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "not logged in" }, { status: 401 });

  // Revoke our access on Strava's side too (best effort).
  try {
    const auth = await getValidAccessToken();
    if (auth) {
      await fetch("https://www.strava.com/oauth/deauthorize", {
        method: "POST",
        body: new URLSearchParams({ access_token: auth.accessToken }),
      });
    }
  } catch {
    // Already revoked or unreachable; still wipe our side.
  }

  await deleteAthleteData(session.athleteId);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
