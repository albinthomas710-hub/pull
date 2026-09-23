"use client";

import { lintLine } from "@/lib/engine";
import { usePull } from "@/lib/store";

export default function LinePage() {
  const { data, setLine, setCompany } = usePull();
  const lint = lintLine(data.line);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">One line</p>
      <h1 className="mt-3 text-4xl">Say the company so a stranger gets it.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Sequoia asks for one declarative sentence. YC ignores the deck and reads this. If the sentence needs “platform”, it is not ready.
      </p>

      <label className="mt-6 block max-w-md text-sm">
        Working name
        <input className="mt-1" value={data.company} onChange={(e) => setCompany(e.target.value)} placeholder="Rate desk" />
      </label>

      <label className="mt-4 block text-sm">
        The sentence
        <textarea className="mt-1 text-lg" value={data.line} onChange={(e) => setLine(e.target.value)} placeholder="We chase signed rate confirmations for small freight brokers." />
      </label>
      <p className="mt-2 text-xs text-[var(--muted)]">{lint.chars} characters. Aim near 50.</p>

      <ul className="mt-4 space-y-2">
        {lint.issues.length === 0 && data.line.trim() && (
          <li className="rounded-2xl bg-[var(--pull-soft)] px-4 py-3 text-sm text-[var(--pull)]">Clear enough to say out loud.</li>
        )}
        {lint.issues.map((issue) => (
          <li key={issue} className="rounded-2xl bg-[var(--stop-soft)] px-4 py-3 text-sm text-[var(--stop)]">{issue}</li>
        ))}
      </ul>

      {data.line.trim() && (
        <p className="display mt-8 max-w-2xl text-3xl leading-tight">
          {data.company ? `${data.company}. ` : ""}
          {data.line}
        </p>
      )}
    </main>
  );
}
