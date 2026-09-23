"use client";

import { useState } from "react";
import { outreach } from "@/lib/engine";
import { uid, usePull } from "@/lib/store";
import type { PersonStatus } from "@/lib/types";

const STATUS: { v: PersonStatus; label: string }[] = [
  { v: "to-contact", label: "Not yet" },
  { v: "talked", label: "Talked" },
  { v: "tried", label: "Tried the work" },
  { v: "paid", label: "Paid" },
  { v: "gone", label: "Gone" },
];

export default function PeoplePage() {
  const { data, addPerson, updatePerson, removePerson } = usePull();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [reach, setReach] = useState("");
  const missing = Math.max(0, 10 - data.people.length);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">People</p>
      <h1 className="mt-3 text-4xl">Ten humans you can actually reach.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Not a persona. A person with a name. {missing > 0 ? `${missing} still missing from a list of ten.` : "You have ten. Now talk to them."}
      </p>

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addPerson({ id: uid(), name: name.trim(), role: role.trim(), reach: reach.trim(), status: "to-contact" });
          setName("");
          setRole("");
          setReach("");
        }}
      >
        <label className="text-sm">
          Name
          <input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Luis Ortega" required />
        </label>
        <label className="text-sm md:col-span-2">
          What they actually do
          <input className="mt-1" value={role} onChange={(e) => setRole(e.target.value)} placeholder="ops lead at a 12-person freight broker" />
        </label>
        <label className="text-sm">
          How you’ll reach them
          <input className="mt-1" value={reach} onChange={(e) => setReach(e.target.value)} placeholder="warm intro, not a list" />
        </label>
        <button type="submit" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)] md:col-span-4 md:w-fit">
          Add this person
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {data.people.length === 0 && <li className="text-sm text-[var(--muted)]">The list is empty. That is the whole problem.</li>}
        {data.people.map((p) => (
          <li key={p.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg">{p.name}</p>
                <p className="text-sm text-[var(--muted)]">{p.role || "Role not written"} · {p.reach || "No way to reach them yet"}</p>
              </div>
              <button type="button" onClick={() => removePerson(p.id)} className="text-xs text-[var(--muted)] underline">
                Remove
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUS.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => updatePerson(p.id, { status: s.v })}
                  className={`rounded-full px-3 py-1 text-xs ${p.status === s.v ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--line)] text-[var(--muted)]"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--ink)]">{outreach(p, data)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
