// Static sample cards for the landing page (made-up numbers, not anyone's data).
const card = "absolute w-[220px] overflow-hidden rounded-3xl bg-[#121513] p-4 ring-1 ring-white/10 shadow-2xl shadow-black/60";

export function SampleCards() {
  return (
    <div className="relative mx-auto h-[460px] w-full max-w-[420px]" aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25 blur-3xl" />

      {/* Back: summary */}
      <div className={`${card} right-0 top-0 rotate-[7deg]`}>
        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Summary</p>
        <p className="mt-2 bg-gradient-to-b from-lime to-lime/60 bg-clip-text text-5xl font-extrabold leading-none text-transparent">1,248<span className="text-lg">km</span></p>
        <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="rounded-xl bg-lime p-2 text-ink"><p className="font-mono text-[8px] opacity-60">LONGEST</p><p className="text-lg font-extrabold">21.4</p></div>
          <div className="rounded-xl bg-white/[0.07] p-2"><p className="font-mono text-[8px] text-zinc-500">STREAK</p><p className="text-lg font-extrabold">12<span className="text-[10px] text-zinc-400"> wk</span></p></div>
          <div className="col-span-2 flex h-12 items-end gap-[3px] rounded-xl bg-white/[0.07] p-2">
            {[30, 45, 35, 60, 50, 80, 100, 70, 55, 40, 65, 45].map((h, i) => <span key={i} className={`flex-1 rounded-sm ${i === 6 ? "bg-lime" : "bg-white/25"}`} style={{ height: `${h}%` }} />)}
          </div>
        </div>
      </div>

      {/* Middle: route ticket */}
      <div className={`${card} left-0 top-[150px] -rotate-[6deg]`}>
        <p className="font-mono text-[9px] uppercase tracking-widest text-lime">Your most-run routes</p>
        <div className="relative mt-3 flex overflow-hidden rounded-2xl bg-white/[0.07]">
          <svg viewBox="0 0 100 100" className="m-2 h-16 w-16 shrink-0"><path d="M18 70 L12 38 Q30 10 62 16 Q90 22 86 52 Q80 82 48 84 Z" fill="none" stroke="#d4ff3f" strokeWidth="3" strokeLinejoin="round" /></svg>
          <div className="relative border-l-2 border-dashed border-white/25">
            <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[#121513]" />
            <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-[#121513]" />
          </div>
          <div className="px-3 py-2"><p className="text-2xl font-extrabold leading-none text-lime">14×</p><p className="font-mono text-[9px] text-zinc-300">5.2 km · fastest 24:31</p></div>
        </div>
      </div>

      {/* Front: total */}
      <div className={`${card} bottom-0 right-6 rotate-[2deg]`}>
        <p className="font-mono text-[9px] uppercase tracking-widest text-lime">2026 · you ran</p>
        <p className="mt-2 text-6xl font-extrabold leading-none">1,248<span className="ml-1 text-lg text-zinc-400">km</span></p>
        <div className="mt-3 rounded-xl bg-white/[0.07] p-2.5">
          <p className="text-xs font-semibold">Delhi → Mumbai, 0.9×</p>
          <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full w-[89%] rounded-full bg-lime" /></div>
        </div>
      </div>
    </div>
  );
}
