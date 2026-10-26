import { cached } from "./cache";
import type { Run } from "./types";
import type { ActivityDetail } from "./efforts";
import { clearSession, getSession, setSession, type Session } from "./session";

const OAUTH_BASE = "https://www.strava.com/oauth";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; firstname: string; profile: string };
};

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function authorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env("STRAVA_CLIENT_ID"),
    redirect_uri: env("STRAVA_REDIRECT_URI"),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read",
    state,
  });
  return `${OAUTH_BASE}/authorize?${params}`;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${OAUTH_BASE}/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: env("STRAVA_CLIENT_ID"),
      client_secret: env("STRAVA_CLIENT_SECRET"),
      ...body,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    // Never log request bodies or tokens.
    throw new Error(`Strava token request failed (${res.status})`);
  }
  return res.json();
}

export function exchangeCode(code: string) {
  return tokenRequest({ code, grant_type: "authorization_code" });
}

/**
 * Returns a non-expired access token, refreshing (and saving the NEW refresh
 * token) when it expires within 5 minutes. Call from route handlers/actions:
 * cookies can't be written from Server Components, in which case the refreshed
 * session just isn't persisted and the next route-handler call refreshes again.
 */
export async function getValidAccessToken(
  opts: { force?: boolean } = {},
): Promise<{ accessToken: string; session: Session; refreshed: boolean } | null> {
  const session = await getSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  if (!opts.force && session.expiresAt - now > 300) {
    return { accessToken: session.accessToken, session, refreshed: false };
  }

  let t: TokenResponse;
  try {
    t = await tokenRequest({ grant_type: "refresh_token", refresh_token: session.refreshToken });
  } catch {
    // Revoked (e.g. deauthorized on Strava): treat as logged out.
    try { await clearSession(); } catch { /* read-only context */ }
    return null;
  }
  const next: Session = {
    ...session,
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: t.expires_at,
  };
  try {
    await setSession(next);
  } catch {
    // Not in a context that can set cookies.
  }
  return { accessToken: next.accessToken, session: next, refreshed: true };
}

export type Activity = Run;

const IST_OFFSET_S = 5.5 * 3600;
const RUN_TYPES = ["Run", "TrailRun"]; // VirtualRun is excluded on purpose

/** Unix-seconds bounds of a calendar year in IST; `before` is capped at now. */
export function yearBounds(year: number) {
  const after = Date.UTC(year, 0, 1) / 1000 - IST_OFFSET_S;
  const end = Date.UTC(year + 1, 0, 1) / 1000 - IST_OFFSET_S - 1;
  return { after, before: Math.min(end, Math.floor(Date.now() / 1000)) };
}

export class StravaError extends Error {
  constructor(public status: number) {
    super(`Strava request failed (${status})`);
  }
}

export const RATE_LIMITED_MESSAGE =
  "Strava's rate limit was hit. Wait a few minutes (it resets every 15 minutes) and reload.";

/** Runs for a year, cached for an hour per athlete. */
export function getRuns(accessToken: string, athleteId: number, year: number): Promise<Run[]> {
  return cached(`runs:${athleteId}:${year}`, 60 * 60 * 1000, () => fetchActivities(accessToken, year));
}

export async function fetchActivities(accessToken: string, year: number): Promise<Activity[]> {
  const base = process.env.STRAVA_API_BASE ?? "https://www.strava.com/api/v3";
  const { after, before } = yearBounds(year);
  const all: Activity[] = [];

  for (let page = 1; ; page++) {
    const res = await fetch(
      `${base}/athlete/activities?after=${after}&before=${before}&per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
    );
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[strava] page ${page} ${res.status} limit=${res.headers.get("x-ratelimit-limit")} usage=${res.headers.get("x-ratelimit-usage")}`,
      );
    }
    if (!res.ok) throw new StravaError(res.status);
    const items: Activity[] = await res.json();
    all.push(...items);
    if (items.length < 200) break;
  }
  return all.filter((a) => RUN_TYPES.includes(a.sport_type));
}

/** Per-activity detail calls (1 each), with limited concurrency. Stops early on rate limiting. */
export async function fetchActivityDetails(
  accessToken: string,
  ids: number[],
  concurrency = 4,
): Promise<{ details: ActivityDetail[]; partial: boolean }> {
  const base = process.env.STRAVA_API_BASE ?? "https://www.strava.com/api/v3";
  const details: ActivityDetail[] = [];
  let partial = false;
  let next = 0;

  async function worker() {
    while (!partial && next < ids.length) {
      const id = ids[next++];
      const res = await fetch(`${base}/activities/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (process.env.NODE_ENV !== "production") {
        console.log(`[strava] detail ${id} ${res.status} usage=${res.headers.get("x-ratelimit-usage")}`);
      }
      if (res.status === 429) { partial = true; return; }
      if (res.ok) details.push(await res.json());
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { details, partial };
}
