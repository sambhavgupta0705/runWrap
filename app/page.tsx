import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PoweredByStrava } from "@/components/PoweredByStrava";
import { SampleCards } from "@/components/landing/SampleCards";

type Params = Promise<{ error?: string; deleted?: string }>;

const ERRORS: Record<string, string> = {
  denied: "Strava login was cancelled.",
  scope: "Please keep “View data about your activities” ticked, we need it to build your recap.",
  state: "Login session expired. Please try again.",
  exchange: "Couldn't complete login with Strava. Please try again.",
};

const STEPS = [
  ["01", "Connect", "Log in with Strava. We only ask to read your activities."],
  ["02", "We crunch your year", "Distance, routes, best efforts, streaks, and when you like to run."],
  ["03", "Watch and share", "Swipe through your story, then save any card for Instagram."],
];

const FEATURES = ["Total distance, compared to real journeys", "Your most-run routes", "Best 5K, 10K, 21K, 30K and 42K", "Year calendar and weekly streak", "Your runner type", "Share-ready 9:16 cards"];

// Redirects logged-in users to their recap and shows login errors.
async function Gate({ searchParams }: { searchParams: Params }) {
  if (await getSession()) redirect("/recap");
  const { error, deleted } = await searchParams;
  return (
    <>
      {deleted && <p className="mb-4 text-lime">Your data has been deleted and runWrap is disconnected from Strava.</p>}
      {error && <p className="mb-4 text-red-400">{ERRORS[error] ?? "Something went wrong."}</p>}
    </>
  );
}

export default function Home({ searchParams }: { searchParams: Params }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-lime/10 blur-3xl" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-extrabold tracking-tight">run<span className="text-lime">Wrap</span></span>
        <Link href="/privacy" className="font-mono text-xs text-zinc-400 hover:text-white">Privacy</Link>
      </nav>

      <main className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 md:grid-cols-2 md:pt-16">
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-lime">Your running year, wrapped</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Every kilometre,<br />
            <span className="bg-gradient-to-r from-lime to-lime/50 bg-clip-text text-transparent">told as a story.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-zinc-400">
            Connect Strava and get a swipeable recap of your year: distance, favourite routes, best efforts and the kind of runner you really are.
          </p>
          <div className="mt-8">
            <Suspense><Gate searchParams={searchParams} /></Suspense>
            <a href="/api/auth/login" className="inline-block transition hover:-translate-y-0.5 hover:opacity-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/strava/connect-with-strava-orange.svg" alt="Connect with Strava" width={237} height={48} className="h-12 w-auto" />
            </a>
            <p className="mt-3 max-w-sm text-xs text-zinc-500">Read-only. Private (“Only You”) activities aren&apos;t included. Nothing is stored on our servers.</p>
          </div>
        </section>
        <SampleCards />
      </main>

      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="rounded-2xl bg-white/[0.05] p-6 ring-1 ring-white/10">
              <p className="font-mono text-sm text-lime">{n}</p>
              <p className="mt-3 text-xl font-bold">{t}</p>
              <p className="mt-2 text-sm text-zinc-400">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {FEATURES.map((f) => <span key={f} className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-zinc-300 ring-1 ring-white/10">{f}</span>)}
        </div>
      </section>

      <footer className="relative mx-auto flex max-w-6xl items-center justify-between border-t border-white/10 px-6 py-6 font-mono text-xs text-zinc-500">
        <span>runWrap</span>
        <PoweredByStrava className="h-4" />
      </footer>
    </div>
  );
}
