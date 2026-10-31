"use client";
import { CountUp } from "../CountUp";
import { fit, pace } from "@/lib/format";
import type { RecapData } from "./types";

export function TotalSlide({ data }: { data: RecapData }) {
  const { totals: t, comparison: c } = data;
  const km = t.distanceKm.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const time = `${t.hours} h ${String(t.minutes).padStart(2, "0")} m`;

  return (
    <div className="flex h-full flex-col justify-center gap-9 px-6 pb-14">
      <div>
        <p className="text-lg font-medium">You ran</p>
        <p className="mt-3 whitespace-nowrap font-display font-black leading-[0.8]" style={{ fontSize: fit(km) }}>
          <CountUp value={t.distanceKm} decimals={1} />
          <span className="ml-[0.08em] text-[0.3em] text-[var(--accent)]">km</span>
        </p>
        <p className="mt-5 max-w-[26ch] text-xl leading-snug">
          {t.runs} runs and {time} on your feet. Average pace {pace(t.avgPaceSecPerKm).replace(" /km", "")} per km.
        </p>
      </div>

      {c.kind === "marathon" ? (
        <div>
          <p className="font-display text-5xl font-extrabold leading-[0.9]">
            {c.multiple ? `${c.multiple.toFixed(1)} marathons` : `${Math.round(c.percent)}% of a marathon`}
          </p>
          <Track fills={[Math.min(1, c.percent / 100)]} labels={["Start", "42.2 km"]} />
          {!c.multiple && <p className="mt-3 text-base opacity-80">{c.kmShort.toFixed(1)} km short of the full distance.</p>}
        </div>
      ) : (
        <div>
          <p className="font-display text-[3.4rem] font-extrabold leading-[0.88]">
            {c.from} to {c.to}, {c.trips.toFixed(1)} times
          </p>
          <Track fills={c.segments} labels={c.segments.length === 1 ? [c.from, c.to] : null} />
          <p className="mt-3 max-w-[32ch] text-base opacity-80">{c.caption}</p>
        </div>
      )}
    </div>
  );
}

/** A road: flat legs with a post at the furthest point you reached. */
function Track({ fills, labels }: { fills: number[]; labels: string[] | null }) {
  return (
    <div className="mt-5">
      <div className="flex gap-1.5">
        {fills.map((fill, i) => (
          <div key={i} className="relative h-4 flex-1 bg-current/25">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${fill * 100}%` }} />
            {i === fills.length - 1 && (
              <span className="absolute -top-2 h-8 w-1 bg-current" style={{ left: `calc(${fill * 100}% - 2px)` }} />
            )}
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-sm opacity-80">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}
