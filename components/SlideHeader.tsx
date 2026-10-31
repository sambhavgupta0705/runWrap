/* eslint-disable @next/next/no-img-element */
import type { RecapData } from "./slides/types";

export function SlideHeader({ data, page, actions, className = "top-8" }: { data: RecapData; page?: string; actions?: React.ReactNode; className?: string }) {
  return (
    <header className={`absolute inset-x-6 z-10 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <img src="/api/avatar" alt="" className="h-7 w-7 rounded-full object-cover" />
        <p className="text-[15px] font-semibold">{data.athlete.firstname}, {data.year}</p>
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {page && <span className="tnum ml-1 text-sm opacity-70">{page}</span>}
      </div>
    </header>
  );
}
