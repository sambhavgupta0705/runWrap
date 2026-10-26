import polyline from "@mapbox/polyline";

/** Draws an encoded polyline as an SVG path, scaled to fit (no map tiles). */
export function RouteSvg({ encoded, className, stroke = "#d4ff3f", width = 3 }: { encoded: string | null; className?: string; stroke?: string; width?: number }) {
  if (!encoded) return <div className={className} />;
  const pts = polyline.decode(encoded); // [lat, lng][]
  if (pts.length < 2) return <div className={className} />;

  const lat0 = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const kx = Math.cos((lat0 * Math.PI) / 180);
  const xy = pts.map(([lat, lng]) => [lng * kx, -lat] as const);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const size = 100, pad = 6;
  const scale = (size - 2 * pad) / Math.max(maxX - minX, maxY - minY, 1e-9);
  const offX = (size - (maxX - minX) * scale) / 2;
  const offY = (size - (maxY - minY) * scale) / 2;
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${((x - minX) * scale + offX).toFixed(2)} ${((y - minY) * scale + offY).toFixed(2)}`).join("");

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Route map">
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
