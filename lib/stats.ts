import type { Run } from "./types";
import { topRoutes } from "./routes";

const MARATHON_KM = 42.195;
const EVEREST_M = 8849;

const km = (r: Run) => r.distance / 1000;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// start_date_local is wall-clock time with a fake "Z": read it by slicing, never via local Date.
function parts(r: Run) {
  const s = r.start_date_local;
  return {
    date: s.slice(0, 10),
    month: Number(s.slice(5, 7)) - 1,
    hour: Number(s.slice(11, 13)),
  };
}
const dayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
// Monday-first week index (1970-01-01 was a Thursday).
const weekIndex = (date: string) => Math.floor((dayNumber(date) + 3) / 7);

/* 1. Totals */
export function totals(runs: Run[]) {
  const distanceKm = sum(runs.map(km));
  const movingSeconds = sum(runs.map((r) => r.moving_time));
  const days = movingSeconds / 86_400;
  return {
    runs: runs.length,
    distanceKm,
    movingSeconds,
    hours: Math.floor(movingSeconds / 3600),
    minutes: Math.floor((movingSeconds % 3600) / 60),
    daysNonStop: days,
    avgPaceSecPerKm: distanceKm > 0 ? movingSeconds / distanceKm : null,
  };
}

/* 2. Comparison */
type Pair = { from: string; to: string; km: number };
const TIERS: { min: number; pairs: Pair[] }[] = [
  { min: 2500, pairs: [{ from: "Kashmir", to: "Kanyakumari", km: 3600 }] },
  {
    min: 1000,
    pairs: [
      { from: "Delhi", to: "Mumbai", km: 1400 },
      { from: "Mumbai", to: "Chennai", km: 1330 },
      { from: "Delhi", to: "Kolkata", km: 1500 },
    ],
  },
  {
    min: 400,
    pairs: [
      { from: "Delhi", to: "Lucknow", km: 555 },
      { from: "Mumbai", to: "Goa", km: 590 },
      { from: "Bengaluru", to: "Hyderabad", km: 570 },
    ],
  },
  {
    min: 100,
    pairs: [
      { from: "Mumbai", to: "Pune", km: 150 },
      { from: "Delhi", to: "Jaipur", km: 280 },
      { from: "Chennai", to: "Bengaluru", km: 345 },
    ],
  },
  {
    min: 50,
    pairs: [
      { from: "Chennai", to: "Mahabalipuram", km: 55 },
      { from: "Pune", to: "Lonavala", km: 65 },
      { from: "Delhi", to: "Meerut", km: 70 },
    ],
  },
];

export type Comparison =
  | { kind: "marathon"; percent: number; kmShort: number; multiple: number | null }
  | {
      kind: "trip";
      from: string;
      to: string;
      oneWayKm: number;
      trips: number; // total / oneWay
      segments: number[]; // fill 0..1 per segment, at most 4
      caption: string;
    };

const ordinalTrips = (n: number) => (n === 1 ? "once" : n === 2 ? "twice" : `${n} times`);

export function compare(totalKm: number, rng: () => number = Math.random): Comparison {
  // Start at the tier matching the total; fall back to lower tiers if no pair fits.
  for (const tier of TIERS) {
    if (totalKm < tier.min) continue;
    const fits = tier.pairs.filter((p) => p.km <= totalKm);
    if (fits.length === 0) continue;
    const p = fits[Math.min(fits.length - 1, Math.floor(rng() * fits.length))];
    const trips = totalKm / p.km;
    const whole = Math.floor(trips);
    const frac = trips - whole;
    const segCount = Math.min(4, Math.ceil(trips));
    const segments = Array.from({ length: segCount }, (_, i) => (i < whole ? 1 : frac));
    const pct = Math.round(frac * 100);
    const lap = whole % 2 === 1 ? "back" : "again";
    const tail = frac > 0.005 ? `, then ${pct}% of the way ${lap}` : "";
    return {
      kind: "trip",
      from: p.from,
      to: p.to,
      oneWayKm: p.km,
      trips,
      segments,
      caption: `${p.km.toLocaleString("en-IN")} km one way. You ran it ${ordinalTrips(whole)}${tail}.`,
    };
  }
  return {
    kind: "marathon",
    percent: Math.min(100, (totalKm / MARATHON_KM) * 100),
    kmShort: Math.max(0, MARATHON_KM - totalKm),
    multiple: totalKm >= MARATHON_KM ? totalKm / MARATHON_KM : null,
  };
}

/* 4. Longest run */
export function longestRun(runs: Run[]) {
  if (runs.length === 0) return null;
  const r = runs.reduce((a, b) => (b.distance > a.distance ? b : a));
  return {
    id: r.id,
    name: r.name,
    date: parts(r).date,
    distanceKm: km(r),
    movingSeconds: r.moving_time,
    paceSecPerKm: r.moving_time / km(r),
    elevationGainM: r.total_elevation_gain,
    polyline: r.map.summary_polyline,
  };
}

/* 5. Year calendar: km per day + 0..4 intensity */
export function calendar(runs: Run[]) {
  const dailyKm: Record<string, number> = {};
  for (const r of runs) {
    const d = parts(r).date;
    dailyKm[d] = (dailyKm[d] ?? 0) + km(r);
  }
  const max = Math.max(0, ...Object.values(dailyKm));
  const levels: Record<string, 0 | 1 | 2 | 3 | 4> = {};
  for (const [d, v] of Object.entries(dailyKm)) {
    const ratio = v / max;
    levels[d] = ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1;
  }
  return { dailyKm, levels };
}

/* 6. Time stats */
export type RunnerType = "Early Bird" | "Morning Runner" | "Lunch Runner" | "Evening Runner" | "Night Owl";

export function runnerTypeForHour(h: number): RunnerType {
  if (h < 7) return "Early Bird";
  if (h < 11) return "Morning Runner";
  if (h < 15) return "Lunch Runner";
  if (h < 21) return "Evening Runner";
  return "Night Owl";
}

/** `monthsElapsed` = months to average over (12 for a finished year, current month number otherwise). */
export function timeStats(runs: Run[], monthsElapsed = 12) {
  const monthlyKm = Array<number>(12).fill(0);
  const monthlySeconds = Array<number>(12).fill(0);
  const buckets: Record<RunnerType, number> = {
    "Early Bird": 0,
    "Morning Runner": 0,
    "Lunch Runner": 0,
    "Evening Runner": 0,
    "Night Owl": 0,
  };
  for (const r of runs) {
    const p = parts(r);
    monthlyKm[p.month] += km(r);
    monthlySeconds[p.month] += r.moving_time;
    buckets[runnerTypeForHour(p.hour)]++;
  }
  const totalKm = sum(monthlyKm);
  const avg = totalKm / monthsElapsed;
  const active = monthlyKm.slice(0, monthsElapsed);
  const busiest = active.indexOf(Math.max(...active));
  const quietest = active.indexOf(Math.min(...active));
  const runnerType =
    runs.length === 0
      ? null
      : (Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0] as RunnerType);
  return {
    totalHours: sum(runs.map((r) => r.moving_time)) / 3600,
    monthlyKm,
    monthlySeconds,
    runnerTypeRuns: runnerType ? buckets[runnerType] : 0,
    busiestMonth: runs.length ? { month: busiest, km: monthlyKm[busiest], seconds: monthlySeconds[busiest], pctVsAvg: avg > 0 ? (monthlyKm[busiest] / avg - 1) * 100 : 0 } : null,
    quietestMonth: runs.length ? { month: quietest, km: monthlyKm[quietest] } : null,
    runnerType,
  };
}

/* 7. Longest streak, in consecutive Monday-Sunday weeks with >=1 run */
export function longestWeeklyStreak(runs: Run[]): number {
  const weeks = [...new Set(runs.map((r) => weekIndex(parts(r).date)))].sort((a, b) => a - b);
  let best = 0;
  let cur = 0;
  weeks.forEach((w, i) => {
    cur = i > 0 && w === weeks[i - 1] + 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
  });
  return best;
}

/* 8. Elevation */
export function elevation(runs: Run[]) {
  const gainM = sum(runs.map((r) => r.total_elevation_gain));
  return { gainM, everests: gainM / EVEREST_M };
}

// TODO: 5K/10K/21K/42K PRs need per-activity detail calls (not in v1).

export function computeRecap(runs: Run[], year: number, now = new Date()) {
  const t = totals(runs);
  const monthsElapsed = year === now.getFullYear() ? now.getMonth() + 1 : 12;
  return {
    year,
    totals: t,
    comparison: compare(t.distanceKm),
    longestRun: longestRun(runs),
    routes: topRoutes(runs),
    calendar: calendar(runs),
    time: timeStats(runs, monthsElapsed),
    weeklyStreak: longestWeeklyStreak(runs),
    elevation: elevation(runs),
  };
}
