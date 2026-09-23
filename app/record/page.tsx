"use client";

import { record } from "@/lib/engine";
import { usePull } from "@/lib/store";

export default function RecordPage() {
  const { data } = usePull();
  const blocks = record(data);
  const text = blocks
    .map((b) => `${b.heading}\n${b.gap ? "Not in the log. Leave this blank." : b.body}`)
    .join("\n\n");

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">The record</p>
      <h1 className="mt-3 text-4xl">An application that cannot lie.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Every paragraph is copied from your log. A gap stays blank. Partners can smell a number you rounded up. So can you, a year from now.
      </p>

      <article className="mt-8 max-w-2xl space-y-6 rounded-3xl border border-[var(--line)] bg-[var(--card)] px-6 py-8 shadow-[0_20px_60px_rgba(28,22,18,0.04)]">
        <header>
          <p className="display text-3xl">{data.company || "Untitled"}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{data.line || "No one-line yet."}</p>
        </header>
        {blocks.map((b) => (
          <section key={b.heading}>
            <h2 className="text-xl">{b.heading}</h2>
            {b.gap ? (
              <p className="mt-2 rounded-xl bg-[var(--stop-soft)] px-3 py-2 text-sm text-[var(--stop)]">
                Not in the log. Leave this blank until it is true.
              </p>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{b.body}</p>
            )}
          </section>
        ))}
      </article>

      <button
        type="button"
        className="mt-4 text-sm text-[var(--pull)] underline decoration-[var(--line)] underline-offset-4"
        onClick={() => navigator.clipboard.writeText(text)}
      >
        Copy the record
      </button>
    </main>
  );
}
