import type { Metadata } from "next";
import { Big_Shoulders, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({ variable: "--font-display-src", subsets: ["latin"], weight: ["700", "800", "900"] });
const body = Schibsted_Grotesk({ variable: "--font-body-src", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://runwrap.vercel.app"),
  title: "runWrap",
  description: "Your running year in seven slides, from your Strava activities. Save any slide as a picture for Instagram stories.",
  openGraph: { title: "runWrap", description: "Your running year in seven slides.", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
