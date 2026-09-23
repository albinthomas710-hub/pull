export type PersonStatus = "to-contact" | "talked" | "tried" | "paid" | "gone";

export type Commitment = "none" | "another-call" | "intro" | "data" | "money";

export type Person = {
  id: string;
  name: string;
  role: string;
  reach: string;
  status: PersonStatus;
};

export type Talk = {
  id: string;
  personId: string;
  at: string;
  pitched: boolean;
  lastTime: string;
  paysToday: string;
  quote: string;
  pain: string;
  commitment: Commitment;
};

export type Manual = {
  id: string;
  personId: string;
  at: string;
  what: string;
  hours: number;
  cameBack: boolean;
};

export type WeekPoint = {
  id: string;
  weekOf: string;
  value: number;
  note: string;
};

export type PullData = {
  company: string;
  line: string;
  metric: string;
  people: Person[];
  talks: Talk[];
  manual: Manual[];
  weeks: WeekPoint[];
};

export const EMPTY: PullData = {
  company: "",
  line: "",
  metric: "people who came back this week",
  people: [],
  talks: [],
  manual: [],
  weeks: [],
};

export type Brief = {
  stage: string;
  kicker: string;
  job: string;
  why: string;
  doNot: string;
  tone: "stop" | "warn" | "pull";
};
