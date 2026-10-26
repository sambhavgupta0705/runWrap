# Running Year Recap: Build Spec (v1)

A "Spotify Wrapped"-style yearly recap for runners. User logs in with Strava and sees their own running year as animated slides plus shareable story cards.

> Working name: pick one that does NOT contain "Strava" (brand guidelines). Footer must say "Powered by Strava" with the official logo/asset.

## Goals for this weekend
Ship a working v1 on my own account, then deploy publicly, then submit for Strava review.
Time budget: 2-3 hours/day. Prefer shipping over polish.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Framer Motion for slide animations
- Postgres (Neon or Supabase) + Prisma for users and tokens
- Leaflet or MapLibre for maps (OpenStreetMap tiles), `@mapbox/polyline` for decoding
- `satori` / `@vercel/og` or `html-to-image` for share cards
- Deploy on Vercel

## Environment variables
```
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/callback
STRAVA_API_BASE=https://www.strava.com/api/v3
STRAVA_WEBHOOK_VERIFY_TOKEN=some-random-string
DATABASE_URL=
SESSION_SECRET=
TOKEN_ENCRYPTION_KEY=
```
Keep `STRAVA_API_BASE` configurable. Strava has announced a new base URL (`https://api-v3.strava.com`) becoming available on January 4, 2027, so migration should be a one-line change.

## Strava API: what to call

Create the app at https://www.strava.com/settings/api. Set Authorization Callback Domain to `localhost` for dev, then the production domain.

New apps start in single-player mode (capacity 1: only my own account). Self-upgrade to 10 athletes from the API settings page (needs a Strava subscription, which I have). More than 10 athletes needs Strava review (submit after launch).

### 1. OAuth login
Redirect user to:
```
https://www.strava.com/oauth/authorize
  ?client_id=CLIENT_ID
  &redirect_uri=REDIRECT_URI
  &response_type=code
  &approval_prompt=auto
  &scope=read,activity:read
```
- Use `activity:read` only (read-only, minimal). Note: this excludes activities set to "Only You". Mention this in the UI ("private activities aren't included").
- On callback, check the returned `scope` query param actually includes `activity:read`. If the user unticked it, show a friendly error.

### 2. Token exchange
```
POST https://www.strava.com/oauth/token
body: client_id, client_secret, code, grant_type=authorization_code
```
Response includes `access_token`, `refresh_token`, `expires_at`, and `athlete` (id, firstname, profile image).

Store `athlete.id`, encrypted `refresh_token`, `access_token`, `expires_at`.

### 3. Token refresh (access tokens last ~6 hours)
```
POST https://www.strava.com/oauth/token
body: client_id, client_secret, grant_type=refresh_token, refresh_token
```
Always save the NEW refresh_token returned. Wrap this in a `getValidAccessToken(athleteId)` helper used before every API call.

### 4. Fetch activities (the only data call for v1)
```
GET {STRAVA_API_BASE}/athlete/activities?after=<unix>&before=<unix>&per_page=200&page=N
Authorization: Bearer <access_token>
```
- `after` = Jan 1 of the recap year 00:00 IST as unix seconds, `before` = Dec 31 23:59:59 IST (or now).
- Loop pages until a page returns fewer than 200 items.
- Fields used from each activity: `id`, `name`, `sport_type`, `distance` (meters), `moving_time` (sec), `elapsed_time`, `total_elevation_gain` (m), `start_date_local`, `start_latlng`, `map.summary_polyline`.
- Keep only `sport_type` in `["Run", "TrailRun"]`. Exclude `VirtualRun` from routes and heatmap.
- This is 1 call per ~200 runs, so rate limits (200 req/15min, 2,000/day app-wide at default) are not a concern for v1.
- Log the `X-RateLimit-Limit` and `X-RateLimit-Usage` response headers in dev.

### 5. Webhook for deauthorization (REQUIRED by Strava API terms)
- `GET /api/webhook`: Strava validation. Respond `{ "hub.challenge": <query hub.challenge> }` if `hub.verify_token` matches env var.
- `POST /api/webhook`: if `object_type === "athlete"` and `updates.authorized === "false"`, delete that athlete's tokens and cached data immediately.
- Register the subscription once the app is deployed (needs a public URL):
```
POST https://www.strava.com/api/v3/push_subscriptions
form: client_id, client_secret, callback_url, verify_token
```
- Also add a "Delete my data" button in the app.

## Stats logic (`lib/stats.ts`)
Pure functions, unit-tested, input is the filtered runs array.

1. **Total distance and time**: sum of `distance` / 1000 (km); sum of `moving_time` (show as "164 h 12 m" plus "6.8 days non-stop", or avg pace if under a day). Also total runs count.
2. **Comparison, by distance tier** (one comparison per user, picked at random from the tier; only pick a pair whose distance is <= the user's total, else fall back to the tier below). Approximate road distances, verify before shipping:
   - 0-50 km: a full marathon (42.195 km). Show "N% of a marathon" with a progress bar and "X km short". If total >= 42.195, show "N.N× a full marathon".
   - 50-100 km: Chennai → Mahabalipuram (~55), Pune → Lonavala (~65), Delhi → Meerut (~70)
   - 100-400 km: Mumbai → Pune (~150), Delhi → Jaipur (~280), Chennai → Bengaluru (~345)
   - 400-1,000 km: Delhi → Lucknow (~555), Mumbai → Goa (~590), Bengaluru → Hyderabad (~570)
   - 1,000-2,500 km: Delhi → Mumbai (~1,400), Mumbai → Chennai (~1,330), Delhi → Kolkata (~1,500)
   - 2,500+ km: Kashmir → Kanyakumari (~3,600)
   Present as "That's like running A → B, N.N×", with a segmented bar (one full segment per completed trip, last one partially filled) and a caption like "1,400 km one way. You ran it once, then 30% of the way back." Show at most 4 segments.
3. **Most-run routes, ranked** (Strava has no route IDs for runs, so cluster ourselves):
   - Key = start point rounded to a ~300 m grid (round `start_latlng` to 3 decimals) + distance bucket (round km to nearest 1, treat ±10% as the same).
   - Group runs by key, take groups with 3+ runs, rank by count.
   - For each top route: count, average pace, fastest time, and one representative polyline (the median-distance run).
   - Show the top 3, with a mini-map each. Name them "Route #1", "Route #2" (let user rename later, not in v1).
   - If fewer than 3 clusters exist, show what there is, with a friendly empty state.
4. **Longest run** (v1 "highest route" = longest only): max `distance`. Show name, date, distance, time, pace, and its map.
5. **Year calendar**: 12 mini month grids (Monday-first), one square per day, colour by that day's total km in 5 levels (none + 4 intensities). Replaces the polyline heatmap for v1 (a map heatmap needs real map tiles; later).
6. **Time stats**: total hours, busiest month (by km, plus % vs the average month), quietest month, and the most common start-time bucket mapped to a runner type: Early Bird (before 7am), Morning Runner (7-11am), Lunch Runner (11am-3pm), Evening Runner (3-9pm), Night Owl (after 9pm). Use `start_date_local`.
7. **Longest streak in WEEKS**: the longest run of consecutive calendar weeks (Monday-Sunday, local dates) with at least one run in each. Not days, so once-a-week runners still get a streak.
8. **Total elevation gain**: sum of `total_elevation_gain` (m). Label it "Elevation gain" everywhere (not "climb"). Optionally show "N Everests" = gain / 8,849 on the summary.

Not in v1: 5K/10K/21K/42K PRs (needs per-activity detail calls). Leave a TODO and an empty slide stub.

## Pages and flow
- `/` landing: hero, "Connect with Strava" (official button asset), one-line privacy note, "Powered by Strava".
- `/api/auth/login` and `/api/auth/callback`: OAuth. Set an httpOnly session cookie containing the athlete id (signed).
- `/recap`: loading state ("Crunching your year..."), then slides:
  1. Total km + total time + distance-tier comparison
  2. Longest run with map (time, pace, elevation gain)
  3. Top routes ranked
  4. Year calendar + weekly streak
  5. Monthly distance bars (busiest month highlighted)
  6. Summary card (runs, hours, elevation gain, weekly streak, longest run, busiest month, runner type) with share/download
- Slides: full-screen, tap or swipe to advance (mobile first, 9:16 feel even on desktop), progress bar on top like Instagram stories, count-up animations for numbers.
- `/privacy`: plain privacy policy (what we read, what we store, how to delete, Strava deauth).

## Share cards
- 1080x1920 PNG per slide (the six above). Design reference: the "Run Recap Cards" canvas, dark ink background, lime #D4FF3F accent, Bricolage Grotesque + JetBrains Mono.
- Footer: app name + "Powered by Strava".
- Generated only for the logged-in user's own data and downloaded or shared by them. No public profile pages, no public URLs of anyone's stats, no leaderboards (Strava's terms restrict showing one athlete's data to others).

## Data and privacy rules
- Store only: athlete id, name, encrypted tokens, and (optionally) a cached computed stats JSON per athlete+year (refresh after 24h).
- Do not store raw polylines longer than needed. Do not log tokens.
- Do not use Strava data for AI training (forbidden by their terms).
- Honor the deauth webhook and delete everything.

## Fallback (build after the main flow works)
"Upload your Strava export" route: user uploads the `activities.csv` / GPX/FIT files from Strava's bulk export, parsed in the browser, same stats functions. Not API-based, so no athlete cap and no approval needed. This keeps the app usable by everyone while Strava review is pending.

## Suggested file structure
```
app/
  page.tsx
  recap/page.tsx
  privacy/page.tsx
  api/auth/login/route.ts
  api/auth/callback/route.ts
  api/recap/route.ts          # returns computed stats JSON for session athlete
  api/webhook/route.ts
  api/me/delete/route.ts
lib/
  strava.ts                   # oauth, refresh, fetchActivities
  stats.ts                    # all stat functions (pure, tested)
  routes.ts                   # clustering
  session.ts
  crypto.ts                   # token encryption
components/
  slides/*.tsx
  RouteMap.tsx, Heatmap.tsx, ShareCard.tsx
prisma/schema.prisma
```

## Build order (do in this order, commit after each)
1. Scaffold Next.js + Tailwind + Prisma; `.env.local` ready.
2. OAuth login + callback + token storage + refresh helper. Verify by printing my own athlete name.
3. `fetchActivities` for the year; log count and total km; compare against my Strava profile stats.
4. `stats.ts` with unit tests (use a small fixture of fake runs).
5. `/api/recap` returning all stats as JSON.
6. Slides UI with real data: total km, comparison, longest run, time stats first.
7. Routes clustering + route maps, then heatmap.
8. Share card export.
9. Webhook, delete-my-data, privacy page.
10. Deploy to Vercel, register webhook subscription, test with a second account.
11. Fallback upload route.
12. Submit to Strava for review (screenshots, privacy URL, description of data use).

## Definition of done for v1
- I can log in with Strava, see all slides with correct numbers (spot-check total km against Strava), and download a share card.
- Deauthorizing the app on Strava deletes my data.
- Deployed on a public URL with a privacy page.
