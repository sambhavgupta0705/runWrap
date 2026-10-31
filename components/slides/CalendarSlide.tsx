"use client";
import { MONTHS } from "@/lib/format";
import type { RecapData } from "./types";

const LEVEL = ["bg-black/[0.07]", "bg-[var(--accent)]/30", "bg-[var(--accent)]/55", "bg-[var(--accent)]/80", "bg-[var(--accent)]"];

export function CalendarSlide({ data }: { data: RecapData }) {
  const { year, calendar, weeklyStreak } = data;
  return (
    <div className="flex h-full flex-col justify-center gap-4 px-6 pb-12">
      <h2 className="font-display text-5xl font-extrabold leading-[0.85]">Every day you ran</h2>
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {MONTHS.map((name, m) => {
          const daysIn = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
          const lead = (new Date(Date.UTC(year, m, 1)).getUTCDay() + 6) % 7; // Monday first
          return (
            <div key={name}>
              <p className="mb-0.5 text-sm font-semibold leading-none">{name}</p>
              <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: lead }, (_, i) => <div key={`l${i}`} />)}
                {Array.from({ length: daysIn }, (_, i) => {
                  const key = `${year}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                  return <div key={key} title={key} className={`aspect-square ${LEVEL[calendar.levels[key] ?? 0]}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-end gap-3 border-t-2 border-current pt-3">
        <p className="font-display text-[4.2rem] font-black leading-[0.75]">{weeklyStreak}</p>
        <p className="pb-0.5 text-base leading-tight">weeks in a row,<br />with a run every week</p>
      </div>
    </div>
  );
}
