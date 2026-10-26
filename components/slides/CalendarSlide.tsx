"use client";
import { MONTHS } from "@/lib/format";
import type { RecapData } from "./types";

const LEVEL = ["bg-white/10", "bg-lime/25", "bg-lime/50", "bg-lime/75", "bg-lime"];

export function CalendarSlide({ data }: { data: RecapData }) {
  const { year, calendar, weeklyStreak } = data;
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6">
      <p className="font-mono text-sm uppercase tracking-widest text-lime">Your year, day by day</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        {MONTHS.map((name, m) => {
          const daysIn = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
          const lead = (new Date(Date.UTC(year, m, 1)).getUTCDay() + 6) % 7; // Monday-first
          return (
            <div key={name}>
              <p className="mb-1 font-mono text-[10px] text-zinc-500">{name}</p>
              <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: lead }, (_, i) => <div key={`l${i}`} />)}
                {Array.from({ length: daysIn }, (_, i) => {
                  const key = `${year}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                  return <div key={key} title={key} className={`aspect-square rounded-[2px] ${LEVEL[calendar.levels[key] ?? 0]}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl bg-white/5 p-4">
        <p className="text-3xl font-extrabold text-lime">{weeklyStreak} weeks</p>
        <p className="text-sm text-zinc-400">longest streak with a run every week</p>
      </div>
    </div>
  );
}
