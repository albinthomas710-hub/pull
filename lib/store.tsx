"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { EXAMPLE } from "./example";
import { EMPTY, type Manual, type Person, type PullData, type Talk, type WeekPoint } from "./types";

const KEY = "pull:v1";

function normalize(raw: Partial<PullData> | null): PullData {
  if (!raw || typeof raw !== "object") return EMPTY;
  return {
    company: typeof raw.company === "string" ? raw.company : "",
    line: typeof raw.line === "string" ? raw.line : "",
    metric: typeof raw.metric === "string" && raw.metric ? raw.metric : EMPTY.metric,
    people: Array.isArray(raw.people) ? raw.people : [],
    talks: Array.isArray(raw.talks) ? raw.talks : [],
    manual: Array.isArray(raw.manual) ? raw.manual : [],
    weeks: Array.isArray(raw.weeks) ? raw.weeks : [],
  };
}

type Store = {
  data: PullData;
  ready: boolean;
  setCompany: (company: string) => void;
  setLine: (line: string) => void;
  setMetric: (metric: string) => void;
  addPerson: (person: Person) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  removePerson: (id: string) => void;
  addTalk: (talk: Talk) => void;
  removeTalk: (id: string) => void;
  addManual: (item: Manual) => void;
  removeManual: (id: string) => void;
  addWeek: (week: WeekPoint) => void;
  removeWeek: (id: string) => void;
  loadExample: () => void;
  reset: () => void;
  replace: (data: PullData) => void;
};

const Ctx = createContext<Store | null>(null);

export function PullProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PullData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(normalize(JSON.parse(raw) as PullData));
    } catch {
      setData(EMPTY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, ready]);

  const store: Store = {
    data,
    ready,
    setCompany: (company) => setData((d) => ({ ...d, company })),
    setLine: (line) => setData((d) => ({ ...d, line })),
    setMetric: (metric) => setData((d) => ({ ...d, metric })),
    addPerson: (person) => setData((d) => ({ ...d, people: [person, ...d.people] })),
    updatePerson: (id, patch) =>
      setData((d) => ({ ...d, people: d.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    removePerson: (id) =>
      setData((d) => ({
        ...d,
        people: d.people.filter((p) => p.id !== id),
        talks: d.talks.filter((t) => t.personId !== id),
        manual: d.manual.filter((m) => m.personId !== id),
      })),
    addTalk: (talk) =>
      setData((d) => ({
        ...d,
        talks: [talk, ...d.talks],
        people: d.people.map((p) =>
          p.id === talk.personId && p.status === "to-contact" ? { ...p, status: "talked" } : p
        ),
      })),
    removeTalk: (id) => setData((d) => ({ ...d, talks: d.talks.filter((t) => t.id !== id) })),
    addManual: (item) =>
      setData((d) => ({
        ...d,
        manual: [item, ...d.manual],
        people: d.people.map((p) => (p.id === item.personId ? { ...p, status: "tried" } : p)),
      })),
    removeManual: (id) => setData((d) => ({ ...d, manual: d.manual.filter((m) => m.id !== id) })),
    addWeek: (week) => setData((d) => ({ ...d, weeks: [...d.weeks.filter((w) => w.weekOf !== week.weekOf), week] })),
    removeWeek: (id) => setData((d) => ({ ...d, weeks: d.weeks.filter((w) => w.id !== id) })),
    loadExample: () => setData(EXAMPLE),
    reset: () => setData(EMPTY),
    replace: (next) => setData(normalize(next)),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function usePull() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePull must be used inside PullProvider");
  return ctx;
}

export function uid() {
  return crypto.randomUUID();
}
