import { COBALT } from "@/lib/theme";

/** A sample race bib: the landing page's one memorable object. Numbers are made up. */
export function Bib() {
  const rows: [string, string][] = [
    ["Runs", "112"],
    ["Longest run", "21.4 km"],
    ["Weekly streak", "12 weeks"],
    ["Runner type", "Dawn Patrol"],
  ];
  return (
    <div className="relative mx-auto w-full max-w-[340px] -rotate-3 bg-white p-6 text-black shadow-[10px_10px_0_0_rgba(0,0,0,0.35)]" role="img" aria-label="Sample race bib showing 1,248.6 kilometres, 112 runs and a 12 week streak">
      {["left-2.5 top-2.5", "right-2.5 top-2.5", "left-2.5 bottom-2.5", "right-2.5 bottom-2.5"].map((pos) => (
        <span key={pos} className={`absolute h-3 w-3 rounded-full border-2 border-black/35 ${pos}`} />
      ))}
      <p className="font-display text-6xl font-black leading-[0.8]">YOUR NAME</p>
      <p className="mt-1 text-base font-medium">2026 running year (sample)</p>
      <p className="mt-5 font-display text-[6.5rem] font-black leading-[0.78]" style={{ color: COBALT }}>
        1,248<span className="text-[0.3em]">km</span>
      </p>
      <dl className="mt-5 border-b-2 border-black">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between border-t-2 border-black py-1.5">
            <dt className="text-sm">{k}</dt>
            <dd className="font-display text-2xl font-extrabold leading-none">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
