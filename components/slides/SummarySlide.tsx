"use client";
import { motion } from "framer-motion";
import { CountUp } from "../CountUp";
import { RouteSvg } from "../RouteSvg";
import { MONTHS_LONG, duration, pace, prettyDate } from "@/lib/format";
import { PERSONAS } from "@/lib/runnerTypes";
import { useStatic } from "../StaticContext";
import type { RecapData } from "./types";

const tile = "rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10";
const label = "font-mono text-[10px] uppercase tracking-wider text-zinc-500";

export function SummarySlide({ data }: { data: RecapData }) {
  const isStatic = useStatic();
  const { totals: t, elevation: e, weeklyStreak, longestRun, time } = data;
  const persona = time.runnerType ? PERSONAS[time.runnerType] : null;
  const max = Math.max(...time.monthlyKm, 1);

  return (
    <div className="relative flex h-full flex-col justify-center gap-4 overflow-hidden px-6">
      {/* Glow + the longest run's route as faint backdrop art */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/25 blur-3xl" />
      <RouteSvg encoded={longestRun?.polyline ?? null} className="pointer-events-none absolute -right-10 top-10 h-72 w-72 opacity-[0.14]" width={2} />

      <div className="relative flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/avatar" alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-lime" />
        <div>
          <p className="font-semibold leading-tight">{data.athlete.firstname}&apos;s {data.year}</p>
          <span className="mt-1 inline-block rounded-full bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-ink">{data.year} recap</span>
        </div>
      </div>

      <div className="relative">
        <CountUp value={t.distanceKm} decimals={1} className="bg-gradient-to-b from-lime to-lime/60 bg-clip-text text-8xl font-extrabold leading-none text-transparent" />
        <span className="ml-2 text-2xl text-zinc-400">km</span>
        <p className="mt-2 font-mono text-xs text-zinc-400">{t.runs} runs · {duration(t.movingSeconds)} · {pace(t.avgPaceSecPerKm)}</p>
      </div>

      <div className="relative grid grid-cols-2 gap-2.5">
        {/* Lime hero tile */}
        <div className="rounded-2xl bg-lime p-3.5 text-ink">
          <p className="font-mono text-[10px] uppercase tracking-wider opacity-60">Longest run</p>
          <p className="mt-1 text-3xl font-extrabold leading-none">{longestRun ? longestRun.distanceKm.toFixed(1) : "–"}<span className="ml-1 text-base">km</span></p>
          {longestRun && <p className="mt-1 font-mono text-[10px] opacity-70">{prettyDate(longestRun.date)}</p>}
        </div>

        <div className={tile}>
          <p className={label}>Weekly streak</p>
          <p className="mt-1 text-3xl font-extrabold leading-none">{weeklyStreak}<span className="ml-1 text-base text-zinc-400">weeks</span></p>
          <div className="mt-2 flex gap-[3px]">
            {Array.from({ length: Math.min(weeklyStreak, 12) }, (_, i) => <span key={i} className="h-1.5 flex-1 rounded-full bg-lime" />)}
          </div>
        </div>

        {/* Wide month tile with sparkline */}
        <div className={`${tile} col-span-2`}>
          <div className="flex items-end justify-between">
            <div>
              <p className={label}>Busiest month</p>
              <p className="mt-1 text-2xl font-extrabold leading-none">{time.busiestMonth ? MONTHS_LONG[time.busiestMonth.month] : "–"}</p>
              {time.busiestMonth && <p className="mt-1 font-mono text-[10px] text-lime">{time.busiestMonth.km.toFixed(0)} km</p>}
            </div>
            <div className="flex h-12 w-40 items-end gap-[3px]">
              {time.monthlyKm.map((km, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 rounded-sm ${i === time.busiestMonth?.month ? "bg-lime" : "bg-white/25"}`}
                  initial={isStatic ? false : { height: 0 }}
                  animate={{ height: `${Math.max((km / max) * 100, km > 0 ? 6 : 0)}%` }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.04 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={tile}>
          <p className={label}>Elevation gain</p>
          <p className="mt-1 text-2xl font-extrabold leading-none">{Math.round(e.gainM).toLocaleString("en-IN")}<span className="ml-1 text-sm text-zinc-400">m</span></p>
          <p className="mt-1 font-mono text-[10px] text-zinc-500">{e.everests.toFixed(2)} Everests</p>
        </div>

        <div className={tile}>
          <p className={label}>Runner type</p>
          <p className="mt-1 text-xl font-extrabold leading-tight">{persona?.title ?? "–"}</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-500">{persona ? `mostly ${persona.window}` : ""}</p>
        </div>
      </div>
      {/* Share/download arrives with step 8. */}
    </div>
  );
}
