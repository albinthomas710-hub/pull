"use client";

import { useState } from "react";
import { growth } from "@/lib/engine";
import { uid, usePull } from "@/lib/store";

export default function NumberPage() {
  const { data, setMetric, addWeek, removeWeek } = usePull();
  const [weekOf, setWeekOf] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const sorted = [...data.weeks].sort((a, b) => a.weekOf.localeCompare(b.weekOf));
  const max = Math.max(1, ...sorted.map((w) => w.value));
  const wow = growth(data);
  const back = data.manual.filter((m) => m.cameBack).length;
  const served = data.manual.length;

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">The number</p>
      <h1 className="mt-3 text-4xl">One number. Same definition. Every week.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Revenue if someone pays. Otherwise people who came back. Not visits, not signups, not likes. 5–7% a week is a good early rate. Around 1% means you have not figured out what you are doing.
      </p>

      <label className="mt-6 block max-w-lg text-sm">
        What are you counting?
        <input className="mt-1" value={data.metric} onChange={(e) => setMetric(e.target.value)} />
      </label>

      {served > 0 && back / served < 0.5 && (
        <p className="mt-4 max-w-2xl rounded-2xl bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]">
          You served {served} and only {back} came back. A rising count of people who leave is not growth. Fix the return before you chase a bigger top line.
        </p>
      )}

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!weekOf || value === "") return;
          addWeek({ id: uid(), weekOf, value: Number(value), note: note.trim() });
          setValue("");
          setNote("");
        }}
      >
        <label className="text-sm">
          Week of
          <input className="mt-1" type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} required />
        </label>
        <label className="text-sm">
          Value
          <input className="mt-1" type="number" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} required />
        </label>
        <label className="text-sm md:col-span-2">
          What changed
          <input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Luis sent a second batch. Priya did not." />
        </label>
        <button type="submit" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)] md:col-span-4 md:w-fit">
          Save this week
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {sorted.length === 0 && <p className="text-sm text-[var(--muted)]">No weeks yet. Do not invent a chart.</p>}
        {sorted.map((w) => (
          <div key={w.id} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
            <p className="text-xs text-[var(--muted)]">{w.weekOf}</p>
            <div className="h-8 rounded-full bg-white">
              <div className="flex h-8 items-center rounded-full bg-[var(--pull)] px-3 text-xs text-white" style={{ width: `${Math.max(12, (w.value / max) * 100)}%` }}>
                {w.value}
              </div>
            </div>
            <button type="button" onClick={() => removeWeek(w.id)} className="text-xs text-[var(--muted)] underline">
              Remove
            </button>
            {w.note && <p className="col-span-3 text-sm text-[var(--muted)]">{w.note}</p>}
          </div>
        ))}
      </div>
      {wow !== null && (
        <p className="mt-6 text-sm">
          Last week over week: <strong>{wow >= 0 ? "+" : ""}{Math.round(wow * 100)}%</strong>
          {wow >= 0.05 ? " — inside the 5–7% band." : wow < 0.01 ? " — around 1%. The work is not working yet." : " — moving, not yet a story."}
        </p>
      )}
    </main>
  );
}
