import type { CSSProperties, ReactNode } from "react";
import { THEMES } from "@/lib/theme";
import { PoweredByStrava } from "./PoweredByStrava";

/** Paints a slide's colour field and exposes --accent / --field to the slide inside. */
export function SlideFrame({ index, className = "", style, children }: { index: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const t = THEMES[index];
  return (
    <div
      className={`relative overflow-hidden transition-colors duration-300 [container-type:inline-size] ${className}`}
      style={{ background: t.bg, color: t.fg, ["--accent" as string]: t.accent, ["--field" as string]: t.bg, ...style }}
    >
      {children}
    </div>
  );
}

export function SlideFooter({ index, className = "bottom-4" }: { index: number; className?: string }) {
  return (
    <footer className={`pointer-events-none absolute inset-x-6 flex items-center justify-between ${className}`}>
      <span className="font-display text-lg font-extrabold leading-none tracking-wide">runWrap</span>
      <PoweredByStrava className="h-3.5" tone={THEMES[index].logo} />
    </footer>
  );
}
