/**
 * What a client sees about their own build, and what they can ask for.
 *
 * The point of this is not fewer emails. It is that "can you just move that
 * button" stops being a sentence in a thread and becomes a line with a status
 * and, where it needs one, a price. That is how a fixed-price business survives
 * change requests instead of absorbing them, and it works even if the customer
 * never opens the page, because the record exists either way.
 *
 * The other half is WAITING ON YOU. Most delays on a small build are the client
 * rather than the builder: photos that never arrived, copy nobody wrote. A line
 * saying "waiting on your photos since the 3rd" turns "why is this late" into a
 * date, without anybody having to be difficult about it.
 */

import type { LeadStatus } from "./pipeline";

export type ChangeStatus = "new" | "in-the-build" | "quoted" | "done" | "not-doing";

export const CHANGE_META: Record<ChangeStatus, { label: string; blurb: string; tone: string }> = {
  new: {
    label: "With me",
    blurb: "I have it. I will come back to you on whether it is included or extra.",
    tone: "border-line-2 bg-ink text-muted",
  },
  "in-the-build": {
    label: "Included",
    blurb: "Part of what you are already paying for. It will be done.",
    tone: "border-turq/40 bg-turq/10 text-turq",
  },
  quoted: {
    label: "Needs a decision",
    blurb: "Outside what we agreed, so it has a price. Nothing happens until you say so.",
    tone: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
  done: {
    label: "Done",
    blurb: "Finished and live.",
    tone: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  "not-doing": {
    label: "Not doing",
    blurb: "We agreed to leave this one.",
    tone: "border-line-2 bg-ink text-muted-2",
  },
};

export type ChangeRequest = {
  id: string;
  /** Their words, not mine. */
  what: string;
  askedAt: string;
  /** Who raised it. Things I spot myself belong here too. */
  askedBy: "you" | "me";
  status: ChangeStatus;
  /** Only when it is outside the quote. Absent means no charge. */
  price?: number;
  /** My reply, shown to them. */
  note?: string;
};

export type WaitingOn = {
  id: string;
  what: string;
  since: string;
};

/** Where the build is, said the way you would say it on the phone. */
export function stageForClient(status: LeadStatus): { title: string; detail: string } | null {
  switch (status) {
    case "quote-accepted":
      return {
        title: "Booked in",
        detail: "You have accepted the quote and you are in the diary. I start shortly.",
      };
    case "in-progress":
      return {
        title: "Being built",
        detail: "I am working on it now. You will see it before anybody else does.",
      };
    case "client-review":
      return {
        title: "With you to look at",
        detail: "It is built and waiting on your eyes. Take your time, then send me everything at once rather than in dribs.",
      };
    case "iterating":
      return {
        title: "Working through your changes",
        detail: "I am going through what you sent. Anything outside the quote is listed below with a price, and nothing gets charged without you agreeing to it first.",
      };
    case "complete":
      return {
        title: "Done and live",
        detail: "Finished and handed over. This page stays here so you have the record.",
      };
    default:
      // Before a quote is accepted there is no build to report on.
      return null;
  }
}

export function makeChangeId(now: Date, random: () => number = Math.random): string {
  return `${now.getTime().toString(36)}${Math.floor(random() * 1e6).toString(36)}`;
}

/** Anything the client still has to decide about. The only thing that blocks me. */
export function needsTheirDecision(changes: ChangeRequest[]): ChangeRequest[] {
  return changes.filter((c) => c.status === "quoted");
}
