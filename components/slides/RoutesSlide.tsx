"use client";
import { RouteSvg } from "../RouteSvg";
import { clock, pace } from "@/lib/format";
import { Empty } from "./LongestSlide";
import type { RecapData } from "./types";

export function RoutesSlide({ data }: { data: RecapData }) {
  const routes = data.routes;
  if (routes.length === 0) return <Empty text="Run the same loop three times and it will show up here." />;
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6 pb-14">
      <h2 className="font-display text-5xl font-extrabold leading-[0.9]">Routes you keep coming back to</h2>
      <ul className="flex flex-col gap-3">
        {routes.map((r) => (
          <li key={r.rank} className="relative flex bg-white text-black">
            <div className="w-[32%] shrink-0 p-3 text-[var(--accent)]">
              <RouteSvg encoded={r.polyline} className="aspect-square w-full" width={3} />
            </div>
            {/* Stub edge: notches cut into the ticket, matching the slide's colour */}
            <div className="relative w-0 border-l-2 border-dashed border-black/40">
              <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--field)]" />
              <span className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-[var(--field)]" />
            </div>
            <div className="min-w-0 flex-1 px-4 py-3">
              <p className="font-display text-6xl font-black leading-[0.8]">{r.count}×</p>
              <p className="mt-2 text-sm leading-snug">
                {r.distanceKm.toFixed(1)} km each, {r.totalKm.toFixed(0)} km in total
                <br />
                {pace(r.avgPaceSecPerKm).replace(" /km", "")} per km on average
                <br />
                Fastest {clock(r.fastestSeconds)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
