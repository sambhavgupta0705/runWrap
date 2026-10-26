import { describe, expect, it } from "vitest";
import type { Run } from "./types";
import { calendar, compare, elevation, longestRun, longestWeeklyStreak, runnerTypeForHour, timeStats, totals } from "./stats";
import { topRoutes } from "./routes";

let id = 0;
const run = (date: string, km: number, o: Partial<Run> = {}): Run => ({
  id: ++id,
  name: `Run ${id}`,
  sport_type: "Run",
  distance: km * 1000,
  moving_time: Math.round(km * 360), // 6:00/km
  elapsed_time: Math.round(km * 370),
  total_elevation_gain: 10,
  start_date_local: `${date}T06:30:00Z`,
  start_latlng: [13.0827, 80.2707],
  map: { summary_polyline: "abc" },
  ...o,
});

describe("totals", () => {
  it("sums distance, time and pace", () => {
    const t = totals([run("2026-01-01", 10), run("2026-01-02", 5)]);
    expect(t.distanceKm).toBe(15);
    expect(t.runs).toBe(2);
    expect(t.avgPaceSecPerKm).toBe(360);
  });
  it("handles no runs", () => {
    expect(totals([]).avgPaceSecPerKm).toBeNull();
  });
});

describe("compare", () => {
  it("marathon progress under 50 km", () => {
    const c = compare(21.0975);
    expect(c.kind).toBe("marathon");
    if (c.kind === "marathon") {
      expect(c.percent).toBeCloseTo(50, 1);
      expect(c.kmShort).toBeCloseTo(21.0975, 3);
      expect(c.multiple).toBeNull();
    }
  });
  it("marathon multiple when total >= 42.195", () => {
    const c = compare(46);
    expect(c.kind === "marathon" && c.multiple).toBeCloseTo(1.09, 2);
  });
  it("falls back to lower tier when no pair fits", () => {
    expect(compare(52).kind).toBe("marathon"); // smallest 50-100 pair is 55 km
  });
  it("460 km picks a 400-1000 km pair with a partial segment", () => {
    const c = compare(460, () => 0); // Delhi → Lucknow 555 > 460, so falls to 100-400 tier
    expect(c.kind).toBe("trip");
    if (c.kind === "trip") {
      expect(c.oneWayKm).toBeLessThanOrEqual(460);
      expect(c.segments.length).toBeLessThanOrEqual(4);
    }
  });
  it("builds caption and segments", () => {
    const c = compare(1820, () => 0); // Delhi → Mumbai 1400
    expect(c.kind === "trip" && c.caption).toBe("1,400 km one way. You ran it once, then 30% of the way back.");
    expect(c.kind === "trip" && c.segments).toEqual([1, expect.closeTo(0.3, 5)]);
  });
  it("caps segments at 4", () => {
    const c = compare(30000);
    expect(c.kind === "trip" && c.segments).toHaveLength(4);
  });
});

describe("longestRun", () => {
  it("picks max distance", () => {
    const l = longestRun([run("2026-02-01", 5), run("2026-02-08", 21.1), run("2026-02-09", 8)]);
    expect(l?.distanceKm).toBeCloseTo(21.1);
    expect(l?.date).toBe("2026-02-08");
  });
});

describe("calendar", () => {
  it("sums per day and assigns levels", () => {
    const c = calendar([run("2026-03-01", 4), run("2026-03-01", 6), run("2026-03-02", 1)]);
    expect(c.dailyKm["2026-03-01"]).toBe(10);
    expect(c.levels["2026-03-01"]).toBe(4);
    expect(c.levels["2026-03-02"]).toBe(1);
    expect(c.levels["2026-03-03"]).toBeUndefined();
  });
});

describe("timeStats", () => {
  it("finds busiest/quietest month and runner type", () => {
    const runs = [run("2026-01-05", 10), run("2026-02-05", 30), run("2026-02-12", 10), run("2026-03-02", 20)];
    const t = timeStats(runs, 3);
    expect(t.busiestMonth?.month).toBe(1);
    expect(t.busiestMonth?.pctVsAvg).toBeCloseTo(100 * (40 / (70 / 3) - 1), 3);
    expect(t.quietestMonth?.month).toBe(0);
    expect(t.runnerType).toBe("Early Bird"); // 06:30
  });
  it("maps hours to types", () => {
    expect(runnerTypeForHour(6)).toBe("Early Bird");
    expect(runnerTypeForHour(7)).toBe("Morning Runner");
    expect(runnerTypeForHour(11)).toBe("Lunch Runner");
    expect(runnerTypeForHour(15)).toBe("Evening Runner");
    expect(runnerTypeForHour(21)).toBe("Night Owl");
  });
});

describe("longestWeeklyStreak", () => {
  it("counts consecutive Mon-Sun weeks, crossing month/year boundaries", () => {
    const runs = [
      run("2025-12-29", 5), // Mon, week A
      run("2026-01-04", 5), // Sun, still week A
      run("2026-01-05", 5), // Mon, week B
      run("2026-01-14", 5), // week C
      run("2026-01-28", 5), // skips a week
    ];
    expect(longestWeeklyStreak(runs)).toBe(3);
  });
  it("is 0 with no runs and 1 for a single run", () => {
    expect(longestWeeklyStreak([])).toBe(0);
    expect(longestWeeklyStreak([run("2026-05-05", 5)])).toBe(1);
  });
});

describe("elevation", () => {
  it("sums gain and converts to Everests", () => {
    const e = elevation([run("2026-01-01", 5, { total_elevation_gain: 4424.5 }), run("2026-01-02", 5, { total_elevation_gain: 4424.5 })]);
    expect(e.gainM).toBe(8849);
    expect(e.everests).toBe(1);
  });
});

describe("topRoutes", () => {
  const A: [number, number] = [13.0827, 80.2707];
  it("clusters by start + distance and ranks by count", () => {
    const runs = [
      ...[10, 10.2, 9.8, 10.1].map((k, i) => run(`2026-01-0${i + 1}`, k, { start_latlng: A })),
      ...[5, 5, 5].map((k, i) => run(`2026-02-0${i + 1}`, k, { start_latlng: [12.9, 80.1] })),
      run("2026-03-01", 15, { start_latlng: A }), // singleton
    ];
    const r = topRoutes(runs);
    expect(r.map((x) => x.count)).toEqual([4, 3]);
    expect(r[0].name).toBe("Route #1");
    expect(r[0].fastestSeconds).toBe(Math.round(9.8 * 360));
  });
  it("returns empty with fewer than 3 matching runs", () => {
    expect(topRoutes([run("2026-01-01", 5), run("2026-01-02", 5)])).toEqual([]);
  });
  it("ignores runs without a start point", () => {
    expect(topRoutes([1, 2, 3].map((i) => run(`2026-01-0${i}`, 5, { start_latlng: [] })))).toEqual([]);
  });
});

import { effortCandidates, pickBestEfforts } from "./efforts";

describe("best efforts", () => {
  const detail = (id: number, date: string, efforts: Record<string, number>) => ({
    id, name: `Run ${id}`, start_date_local: `${date}T06:00:00Z`,
    best_efforts: Object.entries(efforts).map(([name, moving_time]) => ({ name, moving_time })),
  });
  it("takes the fastest effort per distance across activities", () => {
    const r = pickBestEfforts([
      detail(1, "2026-01-01", { "5k": 1500, "10k": 3200, "Half-Marathon": 7000 }),
      detail(2, "2026-02-01", { "5k": 1450, "10k": 3300 }),
    ]);
    expect(r.find((e) => e.key === "5k")).toMatchObject({ seconds: 1450, date: "2026-02-01", paceSecPerKm: 290 });
    expect(r.find((e) => e.key === "10k")?.seconds).toBe(3200);
    expect(r.find((e) => e.key === "21k")?.seconds).toBe(7000);
    expect(r.find((e) => e.key === "42k")?.seconds).toBeNull();
  });
  it("does not confuse Half-Marathon with Marathon", () => {
    const r = pickBestEfforts([detail(1, "2026-01-01", { "Half-Marathon": 7000 })]);
    expect(r.find((e) => e.key === "42k")?.seconds).toBeNull();
  });
  it("picks only long-enough, fastest runs as candidates", () => {
    const runs = [run("2026-01-01", 3), run("2026-01-02", 6), run("2026-01-03", 12)];
    expect(effortCandidates(runs).map((r) => r.distance)).toEqual(expect.arrayContaining([6000, 12000]));
    expect(effortCandidates(runs).some((r) => r.distance === 3000)).toBe(false);
  });
});
