"use client";
import { motion } from "framer-motion";
import { CountUp } from "../CountUp";
import { useStatic } from "../StaticContext";
import { pace } from "@/lib/format";
import type { RecapData } from "./types";

const chip = "rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10";
const mono = "font-mono text-[10px] uppercase tracking-wider text-zinc-500";

export function TotalSlide({ data }: { data: RecapData }) {
  const isStatic = useStatic();
  const { totals: t, comparison: c } = data;
  const timeValue = `${t.hours}h ${String(t.minutes).padStart(2, "0")}m`;
  const timeSub = t.daysNonStop >= 1 ? `${t.daysNonStop.toFixed(1)} days non-stop` : "moving time";

  return (
    <div className="relative flex h-full flex-col justify-center gap-5 overflow-hidden px-6">
      {/* Backdrop: glow + concentric rings */}
      <div className="pointer-events-none absolute -right-28 top-10 h-72 w-72 rounded-full bg-lime/20 blur-3xl" />
      <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-24 top-4 h-80 w-80 text-lime opacity-[0.12]" fill="none" stroke="currentColor">
        {[95, 75, 55, 35, 15].map((r) => <circle key={r} cx="100" cy="100" r={r} strokeWidth="0.6" strokeDasharray={r > 60 ? "2 3" : undefined} />)}
      </svg>

      <div className="relative">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-lime">
          <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_8px_2px_#d4ff3f]" />
          {data.year} · you ran
        </p>
        <div className="mt-3">
          <CountUp value={t.distanceKm} decimals={1} className="bg-gradient-to-b from-white via-lime to-lime/60 bg-clip-text text-[88px] font-extrabold leading-[0.95] tracking-tight text-transparent" />
          <span className="ml-2 text-3xl font-bold text-lime">km</span>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-2">
        <div className={chip}><p className={mono}>Runs</p><p className="mt-1 text-xl font-extrabold">{t.runs}</p><p className="font-mono text-[10px] text-zinc-500">this year</p></div>
        <div className={chip}><p className={mono}>Time</p><p className="mt-1 text-xl font-extrabold">{timeValue}</p><p className="font-mono text-[10px] text-zinc-500">{timeSub}</p></div>
        <div className={chip}><p className={mono}>Avg pace</p><p className="mt-1 text-xl font-extrabold">{pace(t.avgPaceSecPerKm).replace(" /km", "")}</p><p className="font-mono text-[10px] text-zinc-500">per km</p></div>
      </div>

      <div className="relative rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
        {c.kind === "marathon" ? (
          <>
            <p className={mono}>The distance</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-xl font-bold">A full marathon</p>
              <p className="text-3xl font-extrabold leading-none text-lime">{c.multiple ? `${c.multiple.toFixed(1)}×` : `${Math.round(c.percent)}%`}</p>
            </div>
            <Track fills={[Math.min(1, c.percent / 100)]} labels={["Start", "42.2 km"]} isStatic={isStatic} />
            {!c.multiple && <p className="mt-3 text-xs text-zinc-400">{c.kmShort.toFixed(1)} km short of the full distance.</p>}
          </>
        ) : (
          <>
            <p className={mono}>That&apos;s like running</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-2xl font-extrabold leading-tight">{c.from} <span className="text-lime">→</span> {c.to}</p>
              <p className="text-4xl font-extrabold leading-none text-lime">{c.trips.toFixed(1)}×</p>
            </div>
            <Track fills={c.segments} labels={c.segments.length === 1 ? [c.from, c.to] : null} isStatic={isStatic} />
            <p className="mt-3 text-xs text-zinc-400">{c.caption}</p>
          </>
        )}
      </div>
    </div>
  );
}

/** Journey track: one bar per leg with a glowing marker at the furthest point. */
function Track({ fills, labels, isStatic }: { fills: number[]; labels: [string, string] | string[] | null; isStatic: boolean }) {
  return (
    <div className="mt-4">
      <div className="flex gap-1.5">
        {fills.map((fill, i) => (
          <div key={i} className="relative h-3 flex-1 rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-lime"
              initial={isStatic ? false : { width: 0 }}
              animate={{ width: `${fill * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.5 }}
            />
            {i === fills.length - 1 && (
              <motion.span
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-white shadow-[0_0_12px_3px_#d4ff3f]"
                initial={isStatic ? false : { left: "0%" }}
                animate={{ left: `${fill * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.5 }}
              />
            )}
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-500">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}
