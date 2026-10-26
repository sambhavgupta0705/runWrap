"use client";
import { CountUp } from "../CountUp";
import { RouteSvg } from "../RouteSvg";
import { duration, pace, prettyDate } from "@/lib/format";
import type { RecapData } from "./types";

export function LongestSlide({ data }: { data: RecapData }) {
  const l = data.longestRun;
  if (!l) return <Empty text="No runs yet this year." />;
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-8">
      <p className="font-mono text-sm uppercase tracking-widest text-lime">Longest run</p>
      <div>
        <CountUp value={l.distanceKm} decimals={2} className="text-7xl font-extrabold leading-none" />
        <span className="ml-2 text-2xl text-zinc-400">km</span>
      </div>
      <p className="text-lg font-semibold">{l.name}</p>
      <p className="font-mono text-sm text-zinc-400">{prettyDate(l.date)}</p>
      <RouteSvg encoded={l.polyline} className="mx-auto aspect-square w-full max-w-[280px]" />
      <div className="grid grid-cols-3 gap-2 font-mono text-sm">
        <Stat label="Time" value={duration(l.movingSeconds)} />
        <Stat label="Pace" value={pace(l.paceSecPerKm)} />
        <Stat label="Elevation gain" value={`${Math.round(l.elevationGainM)} m`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="text-[10px] uppercase text-zinc-500">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="flex h-full items-center justify-center px-8 text-center text-zinc-400">{text}</div>;
}
