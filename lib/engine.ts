import type { Brief, Commitment, PullData, Talk } from "./types";

export const COMMITMENT_LABEL: Record<Commitment, string> = {
  none: "Nothing",
  "another-call": "A dated next call",
  intro: "An introduction",
  data: "Their real data",
  money: "Money",
};

const BANNED = [
  "platform",
  "revolutionary",
  "ai-powered",
  "ai powered",
  "seamless",
  "next-gen",
  "next gen",
  "disrupt",
  "synergy",
  "cutting-edge",
  "cutting edge",
  "unlock",
  "empower",
  "end-to-end",
  "world-class",
  "game-changing",
  "game changing",
];

export function painKey(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

export function personName(data: PullData, id: string) {
  return data.people.find((p) => p.id === id)?.name ?? "Someone";
}

export function talkScore(t: Talk) {
  let score = 0;
  if (t.lastTime.trim().length > 40) score += 2;
  if (t.paysToday.trim().length > 8) score += 2;
  if (t.quote.trim().length > 20) score += 1;
  score += { none: 0, "another-call": 2, intro: 3, data: 4, money: 5 }[t.commitment];
  if (t.pitched) score = Math.min(score, 2);
  return score;
}

export function signalLabel(t: Talk): "Pitch" | "Polite" | "Behavior" | "Pull" | "Paid" {
  if (t.pitched && t.commitment === "none") return "Pitch";
  if (t.commitment === "money") return "Paid";
  const score = talkScore(t);
  if (score >= 5) return "Pull";
  if (score >= 2) return "Behavior";
  return "Polite";
}

export type Pattern = { label: string; count: number; names: string[]; personIds: string[] };

export function patterns(data: PullData): Pattern[] {
  const map = new Map<string, Pattern>();
  for (const t of data.talks) {
    if (t.pitched) continue;
    const key = painKey(t.pain);
    if (!key) continue;
    const name = personName(data, t.personId);
    const cur = map.get(key) ?? { label: t.pain.trim(), count: 0, names: [], personIds: [] };
    if (!cur.personIds.includes(t.personId)) {
      cur.count += 1;
      cur.names.push(name);
      cur.personIds.push(t.personId);
    }
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function top(data: PullData) {
  return patterns(data)[0];
}

export function growth(data: PullData): number | null {
  const sorted = [...data.weeks].sort((a, b) => a.weekOf.localeCompare(b.weekOf));
  if (sorted.length < 2) return null;
  const prev = sorted[sorted.length - 2].value;
  const cur = sorted[sorted.length - 1].value;
  if (prev <= 0) return null;
  return (cur - prev) / prev;
}

export function brief(data: PullData): Brief {
  const named = data.people.length;
  const talks = data.talks.length;
  const pitched = data.talks.filter((t) => t.pitched).length;
  const pain = top(data);
  const strong = data.talks.some((t) => !t.pitched && t.commitment !== "none");
  const served = new Set(data.manual.map((m) => m.personId));
  const waiting = pain?.personIds.filter((id) => !served.has(id)) ?? [];
  const cameBack = data.manual.filter((m) => m.cameBack).length;
  const wow = growth(data);
  const painText = pain ? `“${pain.label}”` : "the same pain";

  if (named < 5) {
    return {
      stage: "Names",
      tone: "stop",
      kicker: "You do not have a market yet",
      job: `Write ${Math.max(1, 10 - named)} more real people you can message this week. Full name, what they do, and how you will reach them.`,
      why: `${named} named ${named === 1 ? "person" : "people"}. A startup starts when a specific human has the problem, not when a slide says “SMBs”.`,
      doNot: "Do not open a code editor, buy a domain, or design a logo.",
    };
  }

  if (talks === 0) {
    return {
      stage: "A conversation",
      tone: "stop",
      kicker: "Names are not evidence",
      job: `Talk to ${data.people[0]?.name ?? "the first person"}. Ask what they did the last time it happened. Do not mention a product.`,
      why: `You can reach ${named} people and you have heard none of them. Until one of them tells you a specific story, you are still guessing.`,
      doNot: "Do not send a survey, a deck, or a “quick feedback on my idea” note.",
    };
  }

  if (talks >= 2 && pitched / talks > 0.5) {
    return {
      stage: "Stop pitching",
      tone: "stop",
      kicker: "Politeness is not demand",
      job: "The next conversation is about their last week, not your product. Write down their words before you say what you are building.",
      why: `${pitched} of ${talks} conversations included a pitch. People protect your feelings. That number cannot be shown to a partner.`,
      doNot: "Do not demo. Do not ask “would you use this?”",
    };
  }

  if (!pain || pain.count < 3) {
    return {
      stage: "The same pain",
      tone: "warn",
      kicker: "One story is an anecdote",
      job: "Keep talking until three people describe the same pain in their own words, without you naming it first.",
      why: pain
        ? `The strongest thread so far is ${painText}, from ${pain.names.join(", ")}. That is ${pain.count}. You need three.`
        : `${talks} conversation${talks === 1 ? "" : "s"} and no repeated pain yet. Different complaints mean you do not know which problem is the company.`,
      doNot: "Do not pick a brand, a stack, or a five-year vision.",
    };
  }

  if (!strong) {
    return {
      stage: "A commitment",
      tone: "warn",
      kicker: "Recognition is not pull",
      job: `Ask ${pain.names[0]} for one concrete thing: a dated follow-up, an intro, their real files, or money. If they will not, the pain is not urgent.`,
      why: `${pain.count} people described ${painText}. None of them moved. Interest that costs them nothing is worth nothing.`,
      doNot: "Do not build a platform to “make it easier” for people who have not agreed to a next step.",
    };
  }

  if (data.manual.length < 3) {
    const who = waiting[0] ? personName(data, waiting[0]) : pain.names[0];
    return {
      stage: "By hand",
      tone: "pull",
      kicker: "The pilot is the product",
      job: `Do ${painText} by hand for ${who} this week. Send the result. Time how long it takes. Do not automate it.`,
      why: `${pain.names.slice(0, 3).join(", ")} share this pain, and someone already gave you a real commitment. Software is how you scale a job you have already done.`,
      doNot: "Do not hire, incorporate, or spend a month on the “real” version.",
    };
  }

  if (cameBack < 2) {
    return {
      stage: "Did they return",
      tone: "warn",
      kicker: "Delivery is not love",
      job: "Ask the people you served what was missing, and do the job once more for someone who has not come back.",
      why: `You did the work ${data.manual.length} times. ${cameBack} came back. If they would not notice the work disappearing, you do not have a product yet.`,
      doNot: "Do not add features they did not ask for.",
    };
  }

  if (data.weeks.length < 4) {
    return {
      stage: "One number",
      tone: "pull",
      kicker: "Now you are allowed to count",
      job: `Log this week’s “${data.metric}”. One number. Same definition every Monday.`,
      why: `${cameBack} people came back after you did the work by hand. That is the start of love. A partner needs the next few weeks of the same number, not a bigger vision.`,
      doNot: "Do not advertise, raise, or rewrite the product while the number is still a guess.",
    };
  }

  if (wow !== null && wow < 0.01) {
    return {
      stage: "You have not figured it out",
      tone: "stop",
      kicker: "About 1% a week means the engine is wrong",
      job: "Talk to people who did not come back. Find the obstacle. Change the work, not the slogan.",
      why: `Latest week-over-week change is ${Math.round(wow * 100)}%. Paul Graham’s line still holds: 5–7% a week is a good early rate. Around 1% means you have not found the thing yet.`,
      doNot: "Do not buy ads to hide a flat number.",
    };
  }

  return {
    stage: "Write it down",
    tone: "pull",
    kicker: "You have a story someone can check",
    job: "Open The record. Copy only the sentences that point at a name, a quote, or a number in this log.",
    why: `${pain.count} people, the same pain, work done by hand, ${cameBack} returns, ${data.weeks.length} weeks of “${data.metric}”. That is an application. Anything you cannot point at does not go in.`,
    doNot: "Do not add a metric, a customer, or a competitor insight that is not in this log.",
  };
}

export function nextQuestions(data: PullData): string[] {
  const pain = top(data);
  const q = [
    "When was the last time this happened? Walk me through that day.",
    "What did you do instead, and what did that cost in hours or money?",
    "Who else in your job feels this every week?",
  ];
  if (pain) q.unshift(`Have you heard anyone else say “${pain.label}” without you suggesting it?`);
  if (data.talks.some((t) => t.pitched)) {
    q.push("Do not mention what you are building until they have finished the story.");
  }
  if (data.manual.length > 0) {
    q.push("If I stopped doing this for you tomorrow, what would you actually miss?");
  }
  return q.slice(0, 4);
}

export function outreach(person: { name: string; role: string }, data: PullData) {
  const pain = top(data);
  const subject = pain ? `how you deal with ${pain.label}` : "a messy part of the work";
  const who = person.role.trim() || "you";
  return `Hey ${person.name.split(" ")[0] || "there"} — I’m not selling anything. I’m trying to understand how ${who} handles ${subject}. Could I ask what you did the last time it happened? Fifteen minutes, and I’ll send you what I learn.`;
}

export function lintLine(line: string) {
  const lower = line.toLowerCase();
  const hits = BANNED.filter((w) => lower.includes(w));
  const chars = line.trim().length;
  const issues: string[] = [];
  if (!line.trim()) issues.push("Empty. A partner cannot picture the company.");
  if (chars > 70) issues.push("Too long. YC’s useful test is one short sentence, about 50 characters.");
  if (chars > 0 && chars < 20) issues.push("Too thin. Say who it is for and what changes for them.");
  if (hits.length) issues.push(`Cut these words: ${hits.join(", ")}.`);
  if (/^(we are|we're) an? (ai|platform)/i.test(line.trim())) {
    issues.push("Starts like every other application. Start with the person and the job.");
  }
  return { hits, chars, issues };
}

export type RecordBlock = { heading: string; body: string; gap: boolean };

export function record(data: PullData): RecordBlock[] {
  const pain = top(data);
  const clean = data.talks.filter((t) => !t.pitched && t.quote.trim());
  const quotes = clean
    .slice(0, 3)
    .map((t) => `${personName(data, t.personId)}: “${t.quote.trim()}”`)
    .join("\n");
  const served = data.manual.length;
  const back = data.manual.filter((m) => m.cameBack).length;
  const sorted = [...data.weeks].sort((a, b) => a.weekOf.localeCompare(b.weekOf));
  const wow = growth(data);
  const series =
    sorted.length === 0
      ? ""
      : sorted.map((w) => `${w.weekOf}: ${w.value}`).join(", ") +
        (wow === null ? "" : ` (${Math.round(wow * 100)}% last week)`);

  return [
    {
      heading: "What are you making?",
      body: data.line.trim(),
      gap: !data.line.trim(),
    },
    {
      heading: "Who wants this so much they would use a rough version?",
      body: pain
        ? `${pain.names.join(", ")} — ${pain.count} people, unprompted, described “${pain.label}”.`
        : "",
      gap: !pain || pain.count < 3,
    },
    {
      heading: "What do you understand that a smart outsider does not?",
      body: quotes,
      gap: clean.length < 2,
    },
    {
      heading: "What have users done?",
      body:
        served === 0
          ? ""
          : `Did the job by hand ${served} time${served === 1 ? "" : "s"}. ${back} came back for more.`,
      gap: served === 0,
    },
    {
      heading: `Weekly “${data.metric}”`,
      body: series,
      gap: sorted.length < 4,
    },
  ];
}

export function facts(data: PullData) {
  const pain = top(data);
  const wow = growth(data);
  return [
    { label: "Named people", value: String(data.people.length), hint: "10 you can message" },
    { label: "Conversations", value: String(data.talks.length), hint: `${data.talks.filter((t) => !t.pitched).length} without a pitch` },
    { label: "Same pain", value: pain ? String(pain.count) : "0", hint: pain?.label ?? "Not yet" },
    { label: "Commitments", value: String(data.talks.filter((t) => !t.pitched && t.commitment !== "none").length), hint: "Call, intro, data, or money" },
    { label: "Done by hand", value: String(data.manual.length), hint: `${data.manual.filter((m) => m.cameBack).length} came back` },
    { label: "Week over week", value: wow === null ? "—" : `${wow >= 0 ? "+" : ""}${Math.round(wow * 100)}%`, hint: data.metric },
  ];
}
