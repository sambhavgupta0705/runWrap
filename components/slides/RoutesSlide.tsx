"use client";
import { RouteSvg } from "../RouteSvg";
import { duration, pace } from "@/lib/format";
import { Empty } from "./LongestSlide";
import type { RecapData } from "./types";

export function RoutesSlide({ data }: { data: RecapData }) {
  const routes = data.routes;
  if (routes.length === 0) return <Empty text="No route you ran 3+ times yet. Run the same loop again and it'll show up here." />;
  return (
    <div className="flex h-full flex-col justify-center gap-4 px-6">
      <p className="font-mono text-sm uppercase tracking-widest text-lime">Your most-run routes</p>
      <p className="-mt-2 text-2xl font-semibold">Your regular departures</p>
      {routes.map((r) => (
        <div key={r.rank} className="relative flex overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
          {/* Route */}
          <div className="relative w-[34%] shrink-0 bg-black/30 p-2">
            <span className="absolute left-2 top-2 font-mono text-[9px] text-zinc-500">№{String(r.rank).padStart(2, "0")}</span>
            <RouteSvg encoded={r.polyline} className="aspect-square w-full" width={2.5} />
          </div>
          {/* Perforation with notches */}
          <div className="relative w-0 border-l-2 border-dashed border-white/25">
            <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-ink" />
            <span className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-ink" />
          </div>
          {/* Stats */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{r.name} · boarding pass</p>
            <p className="text-3xl font-extrabold leading-none text-lime">{r.count}<span className="ml-0.5 text-base">×</span></p>
            <p className="font-mono text-[11px] text-zinc-300">{r.distanceKm.toFixed(1)} km · {r.totalKm.toFixed(0)} km total</p>
            <p className="font-mono text-[11px] text-zinc-400">avg {pace(r.avgPaceSecPerKm)}</p>
            <p className="font-mono text-[11px] text-white">fastest <span className="rounded bg-lime px-1 font-bold text-ink">{duration(r.fastestSeconds)}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}
