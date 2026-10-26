/* eslint-disable @next/next/no-img-element */
// Official "Powered by Strava" logo (white version, for dark backgrounds). Don't recolour or distort.
export function PoweredByStrava({ className = "h-4" }: { className?: string }) {
  return <img src="/strava/powered-by-strava-white.svg" alt="Powered by Strava" className={`w-auto ${className}`} />;
}
