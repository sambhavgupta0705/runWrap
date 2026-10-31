"use client";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { SlideFooter, SlideFrame } from "./SlideFrame";
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

  if (error) return <Shell footer><Message>{error}</Message></Shell>;
  if (!data) return <Shell footer><Message>Reading your runs from Strava…</Message></Shell>;
  return <Shell><Story data={{ ...data, efforts }} /></Shell>;
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="m-auto max-w-[18ch] px-6 text-center font-display text-4xl font-extrabold leading-none">{children}</p>;
}

function Shell({ children, footer }: { children: React.ReactNode; footer?: boolean }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="flex min-h-dvh items-center justify-center bg-black">
        <SlideFrame index={0} className="flex h-dvh max-h-[900px] w-full max-w-[calc(100dvh*9/16)] flex-col sm:rounded-2xl">
          {children}
          {footer && <SlideFooter index={0} />}
        </SlideFrame>
      </main>
    </MotionConfig>
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
  const last = i === SLIDES.length - 1;
  const Slide = SLIDES[i];
  const Capture = captureIdx !== null ? SLIDES[captureIdx] : null;

  const actions = (
    <>
      <IconButton label="Save image" disabled={busy} onClick={() => save([i])}>
        <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
      </IconButton>
      {canShare && (
        <IconButton label="Share" disabled={busy} onClick={() => save([i], true)}>
          <path d="M12 15V4m0 0L8 8m4-4l4 4M6 12v7h12v-7" />
        </IconButton>
      )}
      {last && (
        <IconButton label="Save all slides" disabled={busy} onClick={() => save(SLIDES.map((_, n) => n))}>
          <path d="M12 3v9m0 0l-3-3m3 3l3-3M4 15l8 4 8-4M4 19l8 4 8-4" transform="translate(0 -2)" />
        </IconButton>
      )}
    </>
  );

  return (
    <SlideFrame
      index={i}
      className="absolute inset-0 select-none"
    >
      <div
        className="h-full"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
          if (Math.abs(dx) > 50) { go(dx < 0 ? 1 : -1); touchX.current = -1e9; }
        }}
      >
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={SLIDES.length} aria-valuenow={i + 1}>
          {SLIDES.map((_, n) => (
            <div key={n} className="h-[3px] flex-1 bg-current/25">
              <div className={`h-full bg-current transition-all duration-300 ${n <= i ? "w-full" : "w-0"}`} />
            </div>
          ))}
        </div>

        {!last ? (
          <SlideHeader data={data} page={`${i + 1} of ${SLIDES.length}`} actions={actions} />
        ) : (
          <div className="absolute right-4 top-7 z-10 flex items-center">{actions}</div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={i} className={`h-full ${last ? "pt-24" : "pt-16"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Slide data={data} />
          </motion.div>
        </AnimatePresence>

        {last && (
          <form action="/api/auth/logout" method="post" className="absolute left-6 top-8 z-30">
            <button className="text-sm underline underline-offset-2">Log out</button>
          </form>
        )}

        <SlideFooter index={i} />

        {/* Tap zones: left third goes back, the rest goes forward. */}
        <button aria-label="Previous slide" className="absolute inset-y-24 left-0 z-10 w-1/3" onClick={() => go(-1)} />
        {!last && <button aria-label="Next slide" className="absolute inset-y-24 right-0 z-10 w-2/3" onClick={() => go(1)} />}
      </div>

      {Capture && captureIdx !== null && (
        <div style={{ position: "fixed", left: -10000, top: 0 }} aria-hidden>
          <StaticContext.Provider value>
            <div ref={cardRef} style={{ width: CARD_W, height: CARD_H }}>
            <SlideFrame index={captureIdx} className="h-full w-full">
              {captureIdx !== SLIDES.length - 1 && <SlideHeader data={data} className="top-6" />}
              <div className="h-full pt-14">
                <Capture data={data} />
              </div>
              <SlideFooter index={captureIdx} className="bottom-5" />
            </SlideFrame>
            </div>
          </StaticContext.Provider>
        </div>
      )}
    </SlideFrame>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-current/10 active:scale-95 disabled:opacity-40"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
