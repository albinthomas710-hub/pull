"use client";

import { useState } from "react";
import { uid, usePull } from "@/lib/store";

export default function HandPage() {
  const { data, addManual, removeManual } = usePull();
  const [personId, setPersonId] = useState("");
  const [at, setAt] = useState("");
  const [what, setWhat] = useState("");
  const [hours, setHours] = useState("2");
  const [cameBack, setCameBack] = useState(false);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">By hand</p>
      <h1 className="mt-3 text-4xl">Do the job before you build the product.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Airbnb answered emails. Stripe installed the integration. If you cannot do this once for one person, you do not know what the software is.
      </p>

      {data.people.length === 0 ? (
        <p className="mt-6 text-sm">You need a named person to serve.</p>
      ) : (
        <form
          className="mt-6 space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!personId || !what.trim()) return;
            addManual({
              id: uid(),
              personId,
              at: at || new Date().toISOString().slice(0, 10),
              what: what.trim(),
              hours: Number(hours) || 0,
              cameBack,
            });
            setWhat("");
            setCameBack(false);
          }}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm md:col-span-2">
              Who
              <select className="mt-1" value={personId} onChange={(e) => setPersonId(e.target.value)} required>
                <option value="">Choose</option>
                {data.people.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              When
              <input className="mt-1" type="date" value={at} onChange={(e) => setAt(e.target.value)} />
            </label>
          </div>
          <label className="text-sm">
            What you actually did
            <textarea className="mt-1" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Took 8 email threads and returned a one-page signed rate." required />
          </label>
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-sm">
              Hours
              <input className="mt-1 w-28" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
            </label>
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-auto" checked={cameBack} onChange={(e) => setCameBack(e.target.checked)} />
              They came back and wanted it again
            </label>
          </div>
          <button type="submit" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)]">
            Log the manual work
          </button>
        </form>
      )}

      <ul className="mt-6 space-y-3">
        {data.manual.map((m) => (
          <li key={m.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg">{data.people.find((p) => p.id === m.personId)?.name}</p>
              <span className={`rounded-full px-2 py-1 text-xs ${m.cameBack ? "bg-[var(--pull-soft)] text-[var(--pull)]" : "bg-[var(--stop-soft)] text-[var(--stop)]"}`}>
                {m.cameBack ? "Came back" : "Did not return"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6">{m.what}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{m.at} · {m.hours}h</p>
            <button type="button" onClick={() => removeManual(m.id)} className="mt-2 text-xs text-[var(--muted)] underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
