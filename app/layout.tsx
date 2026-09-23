import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import Shell from "@/components/Shell";
import { PullProvider } from "@/lib/store";
import "./globals.css";

const sans = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Pull — the weekly instrument for early founders",
  description:
    "Name the people, hear the same pain in their words, do the job by hand, and count one number. Pull will not invent your traction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body suppressHydrationWarning>
        <PullProvider>
          <Shell>{children}</Shell>
        </PullProvider>
      </body>
    </html>
  );
}
