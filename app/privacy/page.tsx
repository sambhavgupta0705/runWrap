import type { Metadata } from "next";
import Link from "next/link";
import { PoweredByStrava } from "@/components/PoweredByStrava";

export const metadata: Metadata = { title: "Privacy · runWrap" };

export default function Privacy() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-white px-6 py-14 text-lg leading-relaxed text-black">
      <Link href="/" className="font-display text-2xl font-black underline underline-offset-4">runWrap</Link>
      <h1 className="mt-8 font-display text-7xl font-black leading-[0.85]">Privacy policy</h1>
      <p className="mt-3 opacity-85">Last updated 26 October 2026</p>

      <Section title="What we read from Strava">
        When you connect, we ask for read access to your profile (name, photo) and your activities
        (<code>read</code> and <code>activity:read</code>). We use your run activities (distance, time,
        elevation, start time and route outline) only to build your yearly recap. Activities set to
        &ldquo;Only You&rdquo; are not included.
      </Section>
      <Section title="What we store">
        We don&apos;t keep a database of users. Your name, photo and Strava access tokens are stored
        in an encrypted cookie in your own browser so you stay logged in (up to 30 days). Your
        activities are fetched when you open your recap and kept in server memory for up to one hour
        to avoid re-fetching, then discarded. They are never written to a database or disk.
      </Section>
      <Section title="Who sees your data">
        Only you. Your recap and the images you download are generated for your account alone. There are
        no public profiles, links or leaderboards, and we don&apos;t sell or share your data. Strava data
        is never used to train AI models.
      </Section>
      <Section title="Deleting your data">
        Log out at the end of your recap to clear your session. To remove runWrap&apos;s access, go to
        Strava under Settings → My Apps. When you deauthorize us on Strava, we receive a notification
        and immediately clear anything we hold for you.
      </Section>
      <Section title="Contact">Questions? Email <a href="mailto:sambhavwork75@gmail.com" className="underline underline-offset-4">sambhavwork75@gmail.com</a>.</Section>
      <PoweredByStrava className="mt-12 h-4" tone="black" />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-3xl font-extrabold leading-none">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
