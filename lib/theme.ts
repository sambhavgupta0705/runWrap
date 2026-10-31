// One flat colour field per slide, like bib colours and track lanes.
export type Theme = { bg: string; fg: string; accent: string; logo: "white" | "black" };

export const COBALT = "#1E3BFF";
export const MARIGOLD = "#FFC61A";
export const POPPY = "#FF5266";
export const JADE = "#17B890";

// Order matches SLIDES in components/Recap.tsx.
export const THEMES: Theme[] = [
  { bg: COBALT, fg: "#FFFFFF", accent: MARIGOLD, logo: "white" }, // total
  { bg: MARIGOLD, fg: "#000000", accent: COBALT, logo: "black" }, // longest run
  { bg: POPPY, fg: "#000000", accent: "#FFFFFF", logo: "black" }, // best efforts
  { bg: JADE, fg: "#000000", accent: COBALT, logo: "black" }, // routes
  { bg: "#FFFFFF", fg: "#000000", accent: COBALT, logo: "black" }, // calendar
  { bg: "#000000", fg: "#FFFFFF", accent: MARIGOLD, logo: "white" }, // months
  { bg: "#FFFFFF", fg: "#000000", accent: COBALT, logo: "black" }, // summary (the bib)
];
