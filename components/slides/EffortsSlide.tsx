"use client";
import { duration, pace, prettyDate } from "@/lib/format";
import type { RecapData } from "./types";

export function EffortsSlide({ data }: { data: RecapData }) {
  const efforts = data.efforts;
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-8">
      <p className="font-mono text-sm uppercase tracking-widest text-lime">Best efforts</p>
      <p className="mb-1 text-2xl font-semibold">Your fastest {data.year} splits</p>
      {efforts === undefined || efforts === null ? (
        <p className="animate-pulse text-zinc-400">{efforts === null ? "Couldn't load best efforts." : "Digging through your runs..."}</p>
      ) : (
        efforts.map((e) => (
          <div key={e.key} className={`flex items-center gap-4 rounded-2xl p-3.5 ring-1 ring-white/10 ${e.seconds ? "bg-white/[0.06]" : "bg-white/[0.02] opacity-50"}`}>
            <span className="w-14 rounded-lg bg-lime py-1.5 text-center text-xl font-extrabold text-ink">{e.label}</span>
            {e.seconds ? (
              <div className="min-w-0 flex-1">
                <p className="font-mono text-2xl font-bold">{duration(e.seconds)}</p>
                <p className="truncate font-mono text-[11px] text-zinc-400">{pace(e.paceSecPerKm)} · {e.date && prettyDate(e.date)}</p>
              </div>
            ) : (
              <p className="font-mono text-sm text-zinc-500">not run yet</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
