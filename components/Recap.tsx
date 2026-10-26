"use client";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { SlideHeader } from "./SlideHeader";
import { StaticContext } from "./StaticContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RecapData } from "./slides/types";
import { TotalSlide } from "./slides/TotalSlide";
import { EffortsSlide } from "./slides/EffortsSlide";
import { LongestSlide } from "./slides/LongestSlide";
import { RoutesSlide } from "./slides/RoutesSlide";
import { CalendarSlide } from "./slides/CalendarSlide";
import { MonthsSlide } from "./slides/MonthsSlide";
import { SummarySlide } from "./slides/SummarySlide";

const SLIDES = [TotalSlide, LongestSlide, EffortsSlide, RoutesSlide, CalendarSlide, MonthsSlide, SummarySlide];
const NAMES = ["total", "longest-run", "best-efforts", "routes", "calendar", "months", "summary"];
// Cards are laid out at 405x720 and rasterised at 1080x1920 (9:16, Instagram story/post-friendly).
const CARD_W = 405;
const CARD_H = 720;
const PIXEL_RATIO = 1080 / CARD_W;

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export function Recap() {
  const [data, setData] = useState<RecapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [efforts, setEfforts] = useState<RecapData["efforts"]>(undefined);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/recap")
      .then(async (r) => {
        if (r.status === 401) { router.replace("/"); return; }
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Something went wrong");
        setData(j);
      })
      .catch((e: Error) => setError(e.message));
    fetch("/api/efforts")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setEfforts(j.efforts))
      .catch(() => setEfforts(null));
  }, [router]);

  if (error) return <Shell><p className="m-auto px-8 text-center text-red-400">{error}</p></Shell>;
  if (!data) return <Shell><p className="m-auto animate-pulse text-zinc-400">Crunching your year...</p></Shell>;
  return <Shell><Story data={{ ...data, efforts }} /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black">
      <div className="relative flex h-dvh max-h-[900px] w-full max-w-[calc(100dvh*9/16)] flex-col overflow-hidden bg-ink sm:rounded-3xl">
        {children}
        <footer className="pointer-events-none absolute inset-x-6 bottom-3 flex justify-between font-mono text-[10px] text-zinc-500">
          <span>runWrap</span>
          <span>Powered by Strava</span>
        </footer>
      </div>
    </main>
  );
}

function Story({ data }: { data: RecapData }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((n) => Math.min(SLIDES.length - 1, Math.max(0, n + d))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const [captureIdx, setCaptureIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const render = useCallback(async (idx: number): Promise<Blob> => {
    setCaptureIdx(idx);
    await frame(); await frame();
    const node = cardRef.current!;
    await Promise.all([...node.querySelectorAll("img")].map((im) => im.decode().catch(() => {})));
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 150));
    const opts = { pixelRatio: PIXEL_RATIO, width: CARD_W, height: CARD_H, cacheBust: true };
    await toPng(node, opts); // first pass warms font/image embedding
    const url = await toPng(node, opts);
    return (await fetch(url)).blob();
  }, []);

  const save = useCallback(async (idxs: number[], share = false) => {
    setBusy(true);
    try {
      const files: File[] = [];
      for (const n of idxs) {
        const blob = await render(n);
        files.push(new File([blob], `runwrap-${data.year}-${n + 1}-${NAMES[n]}.png`, { type: "image/png" }));
      }
      if (share && navigator.canShare?.({ files })) {
        await navigator.share({ files }).catch(() => {});
      } else {
        for (const f of files) {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(f);
          a.download = f.name;
          a.click();
          URL.revokeObjectURL(a.href);
          await new Promise((r) => setTimeout(r, 250));
        }
      }
    } finally {
      setCaptureIdx(null);
      setBusy(false);
    }
  }, [render, data.year]);

  const canShare = typeof navigator !== "undefined" && !!navigator.canShare;
  const Slide = SLIDES[i];
  const Capture = captureIdx !== null ? SLIDES[captureIdx] : null;
  return (
    <div
      className="relative h-full select-none"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 50) { go(dx < 0 ? 1 : -1); touchX.current = -1e9; }
      }}
    >
      <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
        {SLIDES.map((_, n) => (
          <div key={n} className="h-1 flex-1 rounded-full bg-white/20">
            <div className={`h-full rounded-full bg-lime transition-all duration-300 ${n <= i ? "w-full" : "w-0"}`} />
          </div>
        ))}
      </div>
      {i < SLIDES.length - 1 && <SlideHeader data={data} page={`${String(i + 1).padStart(2, "0")} / ${String(SLIDES.length).padStart(2, "0")}`} />}
      <AnimatePresence mode="wait">
        <motion.div key={i} className={`h-full ${i < SLIDES.length - 1 ? "pt-16" : ""}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <Slide data={data} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-9 z-30 flex justify-center gap-2 font-mono text-xs">
        <button disabled={busy} onClick={() => save([i])} className="rounded-full bg-lime px-4 py-2 font-bold text-ink disabled:opacity-50">
          {busy ? "Preparing…" : "Save image"}
        </button>
        {canShare && (
          <button disabled={busy} onClick={() => save([i], true)} className="rounded-full bg-white/10 px-4 py-2 disabled:opacity-50">Share</button>
        )}
        {i === SLIDES.length - 1 && (
          <button disabled={busy} onClick={() => save(SLIDES.map((_, n) => n))} className="rounded-full bg-white/10 px-4 py-2 disabled:opacity-50">Save all</button>
        )}
      </div>
      {Capture && (
        <div style={{ position: "fixed", left: -10000, top: 0 }} aria-hidden>
          <StaticContext.Provider value>
            <div ref={cardRef} className="relative overflow-hidden bg-ink text-[#f4f4f0]" style={{ width: CARD_W, height: CARD_H }}>
              {captureIdx !== SLIDES.length - 1 && <SlideHeader data={data} className="top-6" />}
              <div className={`h-full ${captureIdx !== SLIDES.length - 1 ? "pt-14" : ""}`}>
                <Capture data={data} />
              </div>
              <footer className="absolute inset-x-6 bottom-6 flex justify-between font-mono text-[10px] text-zinc-500">
                <span>runWrap</span>
                <span>Powered by Strava</span>
              </footer>
            </div>
          </StaticContext.Provider>
        </div>
      )}
      {i === SLIDES.length - 1 && (
        <div className="absolute right-4 top-8 z-30 flex flex-col items-end gap-1 text-xs text-zinc-500">
          <form action="/api/auth/logout" method="post">
            <button className="underline">Log out</button>
          </form>
        </div>
      )}
      {/* Tap zones: left third = back, rest = forward. Kept below the summary's logout button. */}
      <button aria-label="Previous" className="absolute inset-y-12 left-0 z-10 w-1/3" onClick={() => go(-1)} />
      {i < SLIDES.length - 1 && <button aria-label="Next" className="absolute inset-y-12 right-0 z-10 w-2/3" onClick={() => go(1)} />}
    </div>
  );
}
