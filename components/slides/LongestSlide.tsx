"use client";
import { CountUp } from "../CountUp";
import { RouteSvg } from "../RouteSvg";
import { duration, fit, pace } from "@/lib/format";
import type { RecapData } from "./types";

const LONG_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function LongestSlide({ data }: { data: RecapData }) {
  const l = data.longestRun;
  if (!l) return <Empty text="No runs yet this year." />;
  const km = l.distanceKm.toFixed(2);
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6 pb-14">
      <div>
        <p className="text-lg font-medium">Your longest run</p>
        <p className="mt-3 whitespace-nowrap font-display font-black leading-[0.8]" style={{ fontSize: fit(km, 38) }}>
          <CountUp value={l.distanceKm} decimals={2} />
          <span className="ml-[0.08em] text-[0.3em] text-[var(--accent)]">km</span>
        </p>
        <p className="mt-4 text-xl font-semibold leading-tight">{l.name}</p>
        <p className="opacity-85">{LONG_DATE.format(new Date(`${l.date}T00:00:00Z`))}</p>
      </div>
      <RouteSvg encoded={l.polyline} className="mx-auto aspect-square max-h-[240px] w-full" width={4} />
      <dl className="grid grid-cols-3 gap-3 border-t-2 border-current pt-3">
        <Fact value={duration(l.movingSeconds)} label="Time" />
        <Fact value={pace(l.paceSecPerKm).replace(" /km", "")} label="Pace per km" />
        <Fact value={`${Math.round(l.elevationGainM)} m`} label="Elevation gain" />
      </dl>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-display text-3xl font-extrabold leading-none">{value}</dd>
      <dt className="mt-1 text-sm opacity-85">{label}</dt>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="flex h-full items-center px-6 pb-14 font-display text-4xl font-extrabold leading-none">{text}</div>;
}
