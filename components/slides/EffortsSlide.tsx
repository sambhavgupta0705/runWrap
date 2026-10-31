"use client";
import { clock, pace } from "@/lib/format";
import type { RecapData } from "./types";

const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function EffortsSlide({ data }: { data: RecapData }) {
  const efforts = data.efforts;
  return (
    <div className="flex h-full flex-col justify-center px-6 pb-14">
      <h2 className="font-display text-5xl font-extrabold leading-[0.9]">Your fastest {data.year} splits</h2>
      {efforts == null ? (
        <p className="mt-6 text-lg">{efforts === null ? "Best efforts couldn't load. Reload to try again." : "Checking your longest runs…"}</p>
      ) : (
        <ol className="mt-5 border-b-2 border-current">
          {efforts.map((e) => (
            <li key={e.key} className={`grid grid-cols-[5.5rem_1fr] items-center gap-3 border-t-2 border-current py-2.5 ${e.seconds ? "" : "opacity-45"}`}>
              <span className="font-display text-[3.4rem] font-black leading-[0.85]">{e.label}</span>
              {e.seconds ? (
                <div>
                  <p className="tnum font-display text-5xl font-extrabold leading-[0.9]">{clock(e.seconds)}</p>
                  <p className="mt-0.5 text-sm">
                    {pace(e.paceSecPerKm).replace(" /km", "")} per km on {e.date && DAY.format(new Date(`${e.date}T00:00:00Z`))}
                  </p>
                </div>
              ) : (
                <p className="text-base">Not run yet</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
