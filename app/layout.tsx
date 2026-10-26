import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Bricolage_Grotesque({ variable: "--font-sans-src", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-src", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Running Year Recap",
  description: "Your running year, as a story.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
