import type { Run } from "./types";

export type TopRoute = {
  rank: number;
  name: string;
  count: number;
  distanceKm: number; // typical one-run distance (median run)
  totalKm: number; // across all runs on this route
  avgPaceSecPerKm: number;
  fastestSeconds: number;
  polyline: string | null; // from the median-distance run
};

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Strava has no route ids for runs, so cluster: start point on a ~300 m grid
 * plus distance rounded to the nearest km. Neighbouring distance buckets
 * (±10%) are merged into the bigger one.
 */
export function topRoutes(runs: Run[], limit = 3): TopRoute[] {
  const withStart = runs.filter((r) => r.start_latlng.length === 2 && r.distance > 0);

  const groups = new Map<string, Run[]>();
  for (const r of withStart) {
    const [lat, lng] = r.start_latlng as [number, number];
    const km = Math.max(1, Math.round(r.distance / 1000));
    const key = `${round3(lat)},${round3(lng)}|${km}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  // Merge distance buckets at the same start whose km differ by <=10%.
  const byStart = new Map<string, { km: number; runs: Run[] }[]>();
  for (const [key, g] of groups) {
    const [start, km] = key.split("|");
    byStart.set(start, [...(byStart.get(start) ?? []), { km: Number(km), runs: g }]);
  }
  const clusters: Run[][] = [];
  for (const buckets of byStart.values()) {
    buckets.sort((a, b) => b.runs.length - a.runs.length);
    const merged: { km: number; runs: Run[] }[] = [];
    for (const b of buckets) {
      const host = merged.find((m) => Math.abs(m.km - b.km) / m.km <= 0.1);
      if (host) host.runs.push(...b.runs);
      else merged.push({ km: b.km, runs: [...b.runs] });
    }
    clusters.push(...merged.map((m) => m.runs));
  }

  return clusters
    .filter((c) => c.length >= 3)
    .sort((a, b) => b.length - a.length)
    .slice(0, limit)
    .map((c, i) => {
      const dist = c.reduce((s, r) => s + r.distance, 0);
      const time = c.reduce((s, r) => s + r.moving_time, 0);
      const median = [...c].sort((a, b) => a.distance - b.distance)[Math.floor(c.length / 2)];
      return {
        rank: i + 1,
        name: `Route #${i + 1}`,
        count: c.length,
        distanceKm: median.distance / 1000,
        totalKm: dist / 1000,
        avgPaceSecPerKm: time / (dist / 1000),
        fastestSeconds: Math.min(...c.map((r) => r.moving_time)),
        polyline: median.map.summary_polyline,
      };
    });
}
