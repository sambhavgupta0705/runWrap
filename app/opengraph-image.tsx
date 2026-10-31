import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "runWrap: your running year in seven slides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COBALT = "#1E3BFF";

export default async function Image() {
  const font = await readFile(join(process.cwd(), "node_modules/@fontsource/big-shoulders/files/big-shoulders-latin-900-normal.woff"));
  const rows: [string, string][] = [["Runs", "112"], ["Longest run", "21.4 km"], ["Weekly streak", "12 weeks"]];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: COBALT, color: "#fff", padding: "0 80px", fontFamily: "BigShoulders" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
          <div style={{ fontSize: 44, lineHeight: 1 }}>runWrap</div>
          <div style={{ fontSize: 116, lineHeight: 0.9, marginTop: 24, display: "flex", flexWrap: "wrap" }}>Your running year in seven slides</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 380, background: "#fff", color: "#000", padding: 28, transform: "rotate(-3deg)", boxShadow: "12px 12px 0 rgba(0,0,0,0.35)" }}>
          <div style={{ fontSize: 64, lineHeight: 0.85 }}>YOUR NAME</div>
          <div style={{ fontSize: 150, lineHeight: 0.85, color: COBALT, marginTop: 14 }}>1,248</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 16, borderBottom: "3px solid #000" }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "3px solid #000", padding: "6px 0", fontSize: 34 }}>
                <span style={{ fontSize: 22, fontFamily: "sans-serif" }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "BigShoulders", data: font, style: "normal", weight: 900 }] },
  );
}
