import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode } from "@/lib/strava";
import { SESSION_COOKIE, cookieOptions, seal, type Session } from "@/lib/session";

function home(req: NextRequest, error?: string) {
  const url = new URL("/", req.url);
  if (error) url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  res.cookies.delete("rw_oauth_state");
  return res;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  if (p.get("error")) return home(req, "denied");

  const state = p.get("state");
  if (!state || state !== req.cookies.get("rw_oauth_state")?.value) {
    return home(req, "state");
  }

  // The athlete can untick scopes on Strava's consent screen.
  const scopes = (p.get("scope") ?? "").split(",");
  if (!scopes.includes("activity:read")) return home(req, "scope");

  const code = p.get("code");
  if (!code) return home(req, "denied");

  let t;
  try {
    t = await exchangeCode(code);
  } catch {
    return home(req, "exchange");
  }
  if (!t.athlete) return home(req, "exchange");

  const session: Session = {
    athleteId: t.athlete.id,
    firstname: t.athlete.firstname,
    profile: t.athlete.profile,
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: t.expires_at,
  };

  const res = NextResponse.redirect(new URL("/recap", req.url));
  res.cookies.set(SESSION_COOKIE, seal(session), cookieOptions);
  res.cookies.delete("rw_oauth_state");
  return res;
}
