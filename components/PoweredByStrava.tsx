/* eslint-disable @next/next/no-img-element */
// Official "Powered by Strava" logo. Use the white file on dark fields and the black file on light ones; never recolour or distort.
export function PoweredByStrava({ className = "h-4", tone = "white" }: { className?: string; tone?: "white" | "black" }) {
  return <img src={`/strava/powered-by-strava-${tone}.svg`} alt="Powered by Strava" className={`w-auto ${className}`} />;
}
