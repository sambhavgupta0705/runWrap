import type { Run } from "./types";

export const EFFORT_TARGETS = [
  { key: "5k", label: "5K", meters: 5000, match: "5k" },
  { key: "10k", label: "10K", meters: 10000, match: "10k" },
  { key: "21k", label: "21K", meters: 21097.5, match: "half-marathon" },
  { key: "30k", label: "30K", meters: 30000, match: "30k" },
  { key: "42k", label: "42K", meters: 42195, match: "marathon" },
] as const;

export type EffortKey = (typeof EFFORT_TARGETS)[number]["key"];

export type BestEffort = {
  key: EffortKey;
  label: string;
  seconds: number | null; // null = never ran that far
  paceSecPerKm: number | null;
  date: string | null;
  activityName: string | null;
};

/** The slice of a Strava activity-detail response we use. */
export type ActivityDetail = {
  id: number;
  name: string;
  start_date_local: string;
  best_efforts?: { name: string; moving_time: number }[];
};

/**
 * Which activities to fetch details for. A best effort can hide inside any run
 * at least that long, but fetching all of them would burn rate limit, so for each
 * distance we take the fastest-average runs that are long enough (capped overall).
 */
export function effortCandidates(runs: Run[], perTarget = 6, cap = 20): Run[] {
  const chosen = new Map<number, Run>();
  for (const t of EFFORT_TARGETS) {
    runs
      .filter((r) => r.distance >= t.meters * 0.995)
      .sort((a, b) => b.distance / b.moving_time - a.distance / a.moving_time)
      .slice(0, perTarget)
      .forEach((r) => chosen.set(r.id, r));
  }
  return [...chosen.values()].slice(0, cap);
}

export function pickBestEfforts(details: ActivityDetail[]): BestEffort[] {
  return EFFORT_TARGETS.map((t) => {
    let best: { seconds: number; d: ActivityDetail } | null = null;
    for (const d of details) {
      for (const e of d.best_efforts ?? []) {
        if (e.name.toLowerCase() === t.match && (!best || e.moving_time < best.seconds)) {
          best = { seconds: e.moving_time, d };
        }
      }
    }
    return {
      key: t.key,
      label: t.label,
      seconds: best?.seconds ?? null,
      paceSecPerKm: best ? best.seconds / (t.meters / 1000) : null,
      date: best ? best.d.start_date_local.slice(0, 10) : null,
      activityName: best?.d.name ?? null,
    };
  });
}
