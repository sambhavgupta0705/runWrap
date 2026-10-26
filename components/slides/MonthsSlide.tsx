"use client";
import { motion } from "framer-motion";
import { MONTHS, MONTHS_LONG, duration } from "@/lib/format";
import { PERSONAS } from "@/lib/runnerTypes";
import { useStatic } from "../StaticContext";
import type { RecapData } from "./types";

export function MonthsSlide({ data }: { data: RecapData }) {
  const isStatic = useStatic();
  const { monthlyKm, busiestMonth, runnerType, runnerTypeRuns, totalHours } = data.time;
  const persona = runnerType ? PERSONAS[runnerType] : null;
  const max = Math.max(...monthlyKm, 1);
  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8">
      <p className="font-mono text-sm uppercase tracking-widest text-lime">Month by month</p>
      {busiestMonth && (
        <p className="text-2xl font-semibold">
          {MONTHS_LONG[busiestMonth.month]} was your biggest: {busiestMonth.km.toFixed(0)} km
          {busiestMonth.pctVsAvg > 1 && <span className="text-lime"> ({Math.round(busiestMonth.pctVsAvg)}% above your average month)</span>}
        </p>
      )}
      <div className="flex h-48 gap-1.5">
        {monthlyKm.map((km, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end">
              <motion.div
                className={`w-full rounded-t ${i === busiestMonth?.month ? "bg-lime" : "bg-white/25"}`}
                initial={isStatic ? false : { height: 0 }}
                animate={{ height: `${Math.max((km / max) * 100, km > 0 ? 2 : 0)}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            </div>
            <span className="font-mono text-[9px] text-zinc-500">{MONTHS[i][0]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-[10px] uppercase text-zinc-500">Total time</p>
          <p>{totalHours.toFixed(1)} h</p>
        </div>
        {busiestMonth && (
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[10px] uppercase text-zinc-500">{MONTHS_LONG[busiestMonth.month]} time</p>
            <p>{duration(busiestMonth.seconds)}</p>
          </div>
        )}
      </div>
      {persona && runnerType && (
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="font-mono text-[10px] uppercase text-zinc-500">{runnerType}</p>
          <p className="text-2xl font-extrabold text-lime">{persona.title}</p>
          <p className="mt-2 text-sm text-zinc-300">
            {runnerTypeRuns} of your {data.totals.runs} runs started {persona.window}. {persona.lines[0]}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{persona.lines[1]}</p>
        </div>
      )}
    </div>
  );
}
