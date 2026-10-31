"use client";
import { fit, MONTHS_LONG } from "@/lib/format";
import { PERSONAS } from "@/lib/runnerTypes";
import type { RecapData } from "./types";

/** The finisher's bib: pin holes, name, the year's distance, and the results list. */
export function SummarySlide({ data }: { data: RecapData }) {
  const { totals: t, elevation: e, weeklyStreak, longestRun, time } = data;
  const persona = time.runnerType ? PERSONAS[time.runnerType] : null;
  const name = data.athlete.firstname.toUpperCase();
  const km = t.distanceKm.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const rows: [string, string][] = [
    ["Runs", String(t.runs)],
    ["Time", `${t.hours} h ${String(t.minutes).padStart(2, "0")} m`],
    ["Elevation gain", `${Math.round(e.gainM).toLocaleString("en-IN")} m`],
    ["Longest run", longestRun ? `${longestRun.distanceKm.toFixed(1)} km` : "–"],
    ["Weekly streak", `${weeklyStreak} weeks`],
    ["Biggest month", time.busiestMonth ? MONTHS_LONG[time.busiestMonth.month] : "–"],
    ["Runner type", persona?.title ?? "–"],
  ];

  return (
    <div className="relative flex h-full flex-col justify-center gap-3 px-6 pb-12">
      {/* Safety-pin holes */}
      {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((pos) => (
        <span key={pos} className={`absolute h-3 w-3 rounded-full border-2 border-black/35 ${pos}`} />
      ))}
      <div>
        <p className="whitespace-nowrap font-display font-black leading-[0.8]" style={{ fontSize: fit(name, 26) }}>{name}</p>
        <p className="mt-1 text-base font-medium">{data.year} running year</p>
      </div>
      <p className="whitespace-nowrap font-display font-black leading-[0.8] text-[var(--accent)]" style={{ fontSize: fit(km, 30) }}>
        {km}
        <span className="ml-[0.08em] text-[0.3em]">km</span>
      </p>
      <dl className="border-b-2 border-current">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-t-2 border-current py-1">
            <dt className="text-base">{k}</dt>
            <dd className="font-display text-[1.7rem] font-extrabold leading-none">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
