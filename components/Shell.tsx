"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { brief } from "@/lib/engine";
import { usePull } from "@/lib/store";
import type { PullData } from "@/lib/types";

const LINKS = [
  { href: "/", label: "This week" },
  { href: "/people", label: "People" },
  { href: "/talks", label: "Talks" },
  { href: "/hand", label: "By hand" },
  { href: "/number", label: "The number" },
  { href: "/line", label: "One line" },
  { href: "/record", label: "The record" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data, ready, loadExample, reset, replace } = usePull();
  const fileRef = useRef<HTMLInputElement>(null);
  const now = brief(data);
  const tone =
    now.tone === "pull" ? "bg-[var(--pull-soft)] text-[var(--pull)]" : now.tone === "warn" ? "bg-[var(--warn-soft)] text-[var(--warn)]" : "bg-[var(--stop-soft)] text-[var(--stop)]";

  function exportLog() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.company || "pull").toLowerCase().replace(/\s+/g, "-")}-log.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(file: File | undefined) {
    if (!file) return;
    file.text().then((text) => {
      replace(JSON.parse(text) as PullData);
    }).catch(() => {
      alert("That file is not a Pull log.");
    });
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-8 px-5 py-6 md:grid-cols-[220px_1fr] md:px-8 md:py-8">
      <aside className="md:sticky md:top-8 md:self-start">
        <Link href="/" className="display block text-3xl text-[var(--ink)]">
          Pull
        </Link>
        <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
          The weekly instrument for founders who are still looking for the truth.
        </p>
        <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {LINKS.map((l) => {
            const on = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm md:rounded-lg ${
                  on ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className={`mt-6 hidden rounded-2xl p-4 md:block ${tone}`}>
          <p className="text-[11px] uppercase tracking-[0.14em]">This week</p>
          <p className="mt-2 text-sm leading-5">{ready ? now.job : "Reading your log…"}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <button type="button" onClick={exportLog} className="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]">
            Export
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]">
            Import
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Replace this log with the worked example? Your current notes will be overwritten on this browser.")) loadExample();
            }}
            className="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
          >
            Example
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Erase this log from this browser?")) reset();
            }}
            className="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
          >
            Start empty
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
