"use client";
import { motion } from "framer-motion";
import { useStatic } from "../StaticContext";
import { MONTHS, MONTHS_LONG, duration } from "@/lib/format";
import { PERSONAS } from "@/lib/runnerTypes";
import type { RecapData } from "./types";

export function MonthsSlide({ data }: { data: RecapData }) {
  const isStatic = useStatic();
  const { monthlyKm, busiestMonth, runnerType, runnerTypeRuns, totalHours } = data.time;
  const persona = runnerType ? PERSONAS[runnerType] : null;
  const max = Math.max(...monthlyKm, 1);

  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6 pb-14">
      {busiestMonth && (
        <div>
          <h2 className="font-display text-5xl font-extrabold leading-[0.9]">{MONTHS_LONG[busiestMonth.month]} was your biggest month</h2>
          <p className="mt-2 text-lg">
            {busiestMonth.km.toFixed(0)} km{busiestMonth.pctVsAvg > 1 ? `, ${Math.round(busiestMonth.pctVsAvg)}% above your monthly average` : ""}.
          </p>
        </div>
      )}
      <div className="flex h-40 gap-1">
        {monthlyKm.map((km, i) => (
          <div key={i} className="flex h-full flex-1 flex-col gap-1">
            <div className="flex flex-1 items-end">
              <motion.div
                className={`w-full ${i === busiestMonth?.month ? "bg-[var(--accent)]" : "bg-current/35"}`}
                initial={isStatic ? false : { height: 0 }}
                animate={{ height: `${Math.max((km / max) * 100, km > 0 ? 2 : 0)}%` }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-center text-xs opacity-70" title={MONTHS[i]}>{MONTHS[i][0]}</span>
          </div>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dd className="tnum font-display text-4xl font-extrabold leading-none">{totalHours.toFixed(1)} h</dd>
          <dt className="mt-1 text-sm opacity-75">on your feet this year</dt>
        </div>
        {busiestMonth && (
          <div>
            <dd className="tnum font-display text-4xl font-extrabold leading-none">{duration(busiestMonth.seconds)}</dd>
            <dt className="mt-1 text-sm opacity-75">in {MONTHS_LONG[busiestMonth.month]}</dt>
          </div>
        )}
      </dl>
      {persona && (
        <div className="border-t-2 border-current pt-3">
          <p className="font-display text-5xl font-black leading-[0.85] text-[var(--accent)]">{persona.title}</p>
          <p className="mt-2 text-base leading-snug">
            {runnerTypeRuns} of your {data.totals.runs} runs started {persona.window}. {persona.lines[0]}
          </p>
        </div>
      )}
    </div>
  );
}
