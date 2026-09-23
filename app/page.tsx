"use client";

import Link from "next/link";
import { brief, facts, nextQuestions, patterns } from "@/lib/engine";
import { usePull } from "@/lib/store";

export default function ThisWeek() {
  const { data, ready } = usePull();
  const now = brief(data);
  const tone =
    now.tone === "pull"
      ? "border-[var(--pull)] bg-[var(--pull-soft)]"
      : now.tone === "warn"
        ? "border-[var(--warn)] bg-[var(--warn-soft)]"
        : "border-[var(--stop)] bg-[var(--stop-soft)]";

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">This week</p>
      <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] md:text-5xl">{ready ? now.job : "Reading your log…"}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-7 text-[var(--ink)]">{now.why}</p>

      <section className={`mt-6 max-w-2xl rounded-2xl border px-5 py-4 ${tone}`}>
        <p className="text-xs uppercase tracking-[0.14em]">Do not</p>
        <p className="mt-1 text-base leading-6">{now.doNot}</p>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {facts(data).map((f) => (
          <div key={f.label} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">{f.label}</p>
            <p className="display mt-1 text-3xl">{f.value}</p>
            <p className="mt-1 text-xs leading-4 text-[var(--muted)]">{f.hint}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <h2 className="text-2xl">The same words</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Only conversations where you did not pitch. Three people, one pain, is the bar.</p>
          <ul className="mt-4 space-y-3">
            {patterns(data).length === 0 && <li className="text-sm text-[var(--muted)]">Nothing repeated yet.</li>}
            {patterns(data).map((p) => (
              <li key={p.label}>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-sm text-[var(--muted)]">
                  {p.count} · {p.names.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <h2 className="text-2xl">Ask this next</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
            {nextQuestions(data).map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          <Link href="/talks" className="mt-5 inline-block text-sm text-[var(--pull)] underline decoration-[var(--line)] underline-offset-4">
            Log the conversation
          </Link>
        </section>
      </div>

      <section className="mt-8 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        <p className="text-[var(--ink)]">How Pull decides, and why the other tools do not</p>
        <p className="mt-2">
          Interview bots and idea scorecards will talk for you or grade a pitch. YC’s order is narrower: specific people, a repeated pain in their words, a commitment, the job done by hand, then one weekly number. Pull only advances you when the log says so. It will not write customers you do not have.
        </p>
      </section>
    </main>
  );
}
