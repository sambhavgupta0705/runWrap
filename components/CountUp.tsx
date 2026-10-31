"use client";
import { animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { useStatic } from "./StaticContext";

const format = (v: number, d: number) => v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

export function CountUp({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isStatic = useStatic();
  useEffect(() => {
    if (isStatic) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (ref.current) ref.current.textContent = format(value, decimals);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v, decimals);
      },
    });
    return () => controls.stop();
  }, [value, decimals, isStatic]);
  return <span ref={ref} className={`tnum ${className ?? ""}`}>{isStatic ? format(value, decimals) : "0"}</span>;
}
