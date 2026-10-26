/* eslint-disable @next/next/no-img-element */
import type { RecapData } from "./slides/types";

export function SlideHeader({ data, page, className = "top-9" }: { data: RecapData; page?: string; className?: string }) {
  return (
    <header className={`absolute inset-x-6 z-10 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2.5">
        <img src="/api/avatar" alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-lime" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">{data.athlete.firstname}&apos;s {data.year}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Running recap</p>
        </div>
      </div>
      {page && <span className="font-mono text-[10px] text-zinc-500">{page}</span>}
    </header>
  );
}
