import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Bib } from "@/components/landing/Bib";
import { PoweredByStrava } from "@/components/PoweredByStrava";
import { THEMES } from "@/lib/theme";

type Params = Promise<{ error?: string; deleted?: string }>;

const ERRORS: Record<string, string> = {
  denied: "Strava login was cancelled. Connect again to continue.",
  scope: "runWrap needs permission to view your activities. Connect again and keep that box ticked.",
  state: "The login session expired. Connect again to continue.",
  exchange: "Strava didn't complete the login. Connect again to retry.",
};

// What each slide shows, with sample numbers, in the slide's own colours.
const SLIDES = [
  { big: "1,248", small: "km this year" },
  { big: "21.4", small: "km, your longest run" },
  { big: "24:51", small: "your fastest 5K" },
  { big: "14×", small: "the same loop" },
  { big: "12", small: "weeks in a row" },
  { big: "Feb", small: "your biggest month" },
  { big: "Bib", small: "everything on one page" },
];

// Redirects logged-in users to their recap and shows login errors.
async function Gate({ searchParams }: { searchParams: Params }) {
  if (await getSession()) redirect("/recap");
  const { error, deleted } = await searchParams;
  const message = deleted ? "Your data is deleted and runWrap is disconnected from Strava." : error ? (ERRORS[error] ?? "Something went wrong. Try connecting again.") : null;
  return message ? <p role="alert" className="mb-5 max-w-[40ch] border-l-4 border-current pl-3 text-lg font-semibold">{message}</p> : null;
}

export default function Home({ searchParams }: { searchParams: Params }) {
  return (
    <>
      <section className="bg-[#1E3BFF] text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-3xl font-black leading-none">runWrap</span>
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-10 md:grid-cols-[1.15fr_0.85fr] md:pt-16">
          <div>
            <h1 className="font-display text-[clamp(4.5rem,13vw,10rem)] font-black leading-[0.9]">
              Your running year in seven slides
            </h1>
            <p className="mt-7 max-w-[34ch] text-xl leading-snug">
              Log in with Strava and we turn your runs into a short story you can swipe through, then save any slide as a picture.
            </p>
            <div className="mt-9">
              <Suspense><Gate searchParams={searchParams} /></Suspense>
              <a href="/api/auth/login" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/strava/connect-with-strava-orange.svg" alt="Connect with Strava" width={237} height={48} className="h-12 w-auto" />
              </a>
              <p className="mt-4 max-w-[44ch] text-base opacity-85">
                We only read your run activities. Nothing is posted to Strava, and activities you set to Only You are left out.
              </p>
            </div>
          </div>
          <Bib />
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-5xl font-extrabold leading-[0.9] sm:text-6xl">What you get</h2>
          <ul className="mt-8 flex snap-x gap-3 overflow-x-auto pb-4">
            {SLIDES.map((s, i) => (
              <li
                key={s.small}
                className="flex aspect-[9/16] w-[150px] shrink-0 snap-start flex-col justify-end p-3 ring-1 ring-white/20"
                style={{ background: THEMES[i].bg, color: THEMES[i].fg }}
              >
                <p className="font-display text-6xl font-black leading-[0.8]">{s.big}</p>
                <p className="mt-1.5 text-sm leading-tight">{s.small}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[48ch] text-lg">Every slide saves as a 1080 × 1920 picture, the size Instagram stories use. Sample numbers shown.</p>
        </div>
        <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-white/20 px-6 py-6">
          <span className="font-display text-xl font-extrabold leading-none">runWrap</span>
          <PoweredByStrava className="h-4" />
        </footer>
      </section>
    </>
  );
}
