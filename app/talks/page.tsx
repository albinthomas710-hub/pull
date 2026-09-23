"use client";

import { useState } from "react";
import { COMMITMENT_LABEL, signalLabel } from "@/lib/engine";
import { uid, usePull } from "@/lib/store";
import type { Commitment } from "@/lib/types";

const EMPTY_FORM = {
  personId: "",
  at: "",
  pitched: false,
  lastTime: "",
  paysToday: "",
  quote: "",
  pain: "",
  commitment: "none" as Commitment,
};

export default function TalksPage() {
  const { data, addTalk, removeTalk } = usePull();
  const [form, setForm] = useState(EMPTY_FORM);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Talks</p>
      <h1 className="mt-3 text-4xl">What they did. Not what they promised you.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        If you described the product, Pull marks the conversation as a pitch and will not count it as evidence. “Sounds cool” is a zero.
      </p>

      {data.people.length === 0 ? (
        <p className="mt-6 text-sm">Add a person first. A conversation with “a founder I met” is not a log.</p>
      ) : (
        <form
          className="mt-6 space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.personId || !form.pain.trim()) return;
            addTalk({ id: uid(), ...form, at: form.at || new Date().toISOString().slice(0, 10) });
            setForm({ ...EMPTY_FORM, personId: form.personId });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Who
              <select className="mt-1" value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })} required>
                <option value="">Choose</option>
                {data.people.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              When
              <input className="mt-1" type="date" value={form.at} onChange={(e) => setForm({ ...form, at: e.target.value })} />
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 w-auto"
              checked={form.pitched}
              onChange={(e) => setForm({ ...form, pitched: e.target.checked })}
            />
            <span>
              I described what I’m building.
              <span className="block text-[var(--stop)]">If this is checked, the talk cannot prove demand.</span>
            </span>
          </label>
          <label className="text-sm">
            What did they do the last time this happened?
            <textarea className="mt-1" value={form.lastTime} onChange={(e) => setForm({ ...form, lastTime: e.target.value })} placeholder="Tuesday, a specific load, 40 minutes in the inbox…" />
          </label>
          <label className="text-sm">
            What do they already pay, in money or hours?
            <input className="mt-1" value={form.paysToday} onChange={(e) => setForm({ ...form, paysToday: e.target.value })} placeholder="A coordinator, $18/hour, plus late trucks" />
          </label>
          <label className="text-sm">
            Their words, as close as you can get
            <textarea className="mt-1" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="I don’t need another TMS. I need the signed rate in my hand." />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              The pain, in a few of their words
              <input className="mt-1" value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })} placeholder="chasing signed rate confirmations" required />
            </label>
            <label className="text-sm">
              What did they actually commit to?
              <select className="mt-1" value={form.commitment} onChange={(e) => setForm({ ...form, commitment: e.target.value as Commitment })}>
                {(Object.keys(COMMITMENT_LABEL) as Commitment[]).map((k) => (
                  <option key={k} value={k}>{COMMITMENT_LABEL[k]}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)]">
            Save this conversation
          </button>
        </form>
      )}

      <ul className="mt-6 space-y-3">
        {data.talks.map((t) => {
          const signal = signalLabel(t);
          const chip =
            signal === "Paid" || signal === "Pull"
              ? "bg-[var(--pull-soft)] text-[var(--pull)]"
              : signal === "Behavior"
                ? "bg-[var(--warn-soft)] text-[var(--warn)]"
                : "bg-[var(--stop-soft)] text-[var(--stop)]";
          return (
            <li key={t.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg">{data.people.find((p) => p.id === t.personId)?.name ?? "Unknown"}</p>
                  <p className="text-xs text-[var(--muted)]">{t.at} · {t.pain}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${chip}`}>{signal}</span>
              </div>
              {t.quote && <p className="mt-3 text-sm leading-6">“{t.quote}”</p>}
              <p className="mt-2 text-sm text-[var(--muted)]">{t.lastTime}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {t.pitched ? "Pitched. Not evidence. " : ""}
                Commitment: {COMMITMENT_LABEL[t.commitment]}
                {t.paysToday ? ` · Pays today: ${t.paysToday}` : ""}
              </p>
              <button type="button" onClick={() => removeTalk(t.id)} className="mt-2 text-xs text-[var(--muted)] underline">
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
