/**
 * The pipeline a lead moves through, from the form landing to the site being
 * finished.
 *
 * This is the single source of truth for the stage list. The admin grid, the
 * detail page and the stored lead all read it, so a stage cannot be spelled one
 * way on screen and another way in the data.
 *
 * A brand new lead has NO stored status. That absence is meaningful. It means
 * "nothing has happened yet", so it is rendered as `fresh-lead` rather than as
 * a blank, and it is never written to the blob just to make the field exist.
 */

/**
 * The nine stages a lead moves FORWARD through, in order. This is the ordered
 * pipeline: the progress bar, the "furthest along" sort and the stage number
 * all read it.
 */
export const PIPELINE_STATUSES = [
  "fresh-lead",
  "contact-made",
  "discovery-done",
  "quote-sent",
  "quote-accepted",
  "in-progress",
  "client-review",
  "iterating",
  "complete",
] as const;

/**
 * Every stage a lead may be in, including the ones that are not steps forward.
 *
 * "Lost" is deliberately NOT part of `PIPELINE_STATUSES`: it is an outcome, not
 * progress, so it has no position on the bar and never counts as furthest along.
 * It exists because a pipeline with only forward stages has nowhere to put a
 * lead that went quiet, and those pile up looking like work you have dropped.
 */
export const LEAD_STATUSES = [...PIPELINE_STATUSES, "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

/** True for the stages that mean nothing more is going to happen. */
export function isClosed(status: LeadStatus): boolean {
  return status === "complete" || status === "lost";
}

/** Position on the bar, or null for a stage that is not on it. */
export function pipelinePosition(status: LeadStatus): number | null {
  const index = (PIPELINE_STATUSES as readonly string[]).indexOf(status);
  return index === -1 ? null : index + 1;
}

/** What a lead is before anyone has touched it. Never persisted on its own. */
export const DEFAULT_STATUS: LeadStatus = "fresh-lead";

type StatusMeta = {
  label: string;
  /** What has to have happened for this stage to be true. Shown on the picker. */
  meaning: string;
  /** Tailwind classes for the pill. */
  pill: string;
  dot: string;
  /** Stages past this point are live work rather than sales. */
  phase: "sales" | "build" | "done" | "lost";
};

export const STATUS_META: Record<LeadStatus, StatusMeta> = {
  "fresh-lead": {
    label: "Fresh Lead",
    meaning: "The form came in. Nobody has replied yet.",
    pill: "border-pink/40 bg-pink/10 text-pink",
    dot: "bg-pink",
    phase: "sales",
  },
  "contact-made": {
    label: "Contact Made",
    meaning: "You have emailed or WhatsApped them.",
    pill: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    phase: "sales",
  },
  "discovery-done": {
    label: "Discovery Done",
    meaning: "The 30-minute call has happened.",
    pill: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    dot: "bg-sky-400",
    phase: "sales",
  },
  "quote-sent": {
    label: "Quote Sent",
    meaning: "A fixed written quote is with them.",
    pill: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
    dot: "bg-indigo-400",
    phase: "sales",
  },
  "quote-accepted": {
    label: "Quote Accepted",
    meaning: "They said yes. Work has not started.",
    pill: "border-violet-400/40 bg-violet-400/10 text-violet-300",
    dot: "bg-violet-400",
    phase: "sales",
  },
  "in-progress": {
    label: "In Progress",
    meaning: "You are building it.",
    pill: "border-turq/40 bg-turq/10 text-turq",
    dot: "bg-turq",
    phase: "build",
  },
  "client-review": {
    label: "Client Review",
    meaning: "It is with them to look at. The ball is theirs.",
    pill: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    dot: "bg-orange-400",
    phase: "build",
  },
  iterating: {
    label: "Iterating",
    meaning: "Working through their feedback.",
    pill: "border-teal-400/40 bg-teal-400/10 text-teal-300",
    dot: "bg-teal-400",
    phase: "build",
  },
  complete: {
    label: "Complete",
    meaning: "Delivered and done.",
    pill: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    phase: "done",
  },
  lost: {
    label: "Lost",
    meaning: "Not proceeding. They went quiet, said no, or went elsewhere.",
    pill: "border-line-2 bg-ink text-muted",
    dot: "bg-muted-2",
    phase: "lost",
  },
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(status: LeadStatus): string {
  return STATUS_META[status].label;
}

/**
 * Rank for the "furthest along" sort. Lost sorts below everything, because a
 * dead lead is not further along than a live one. It is out of the race.
 */
export function statusIndex(status: LeadStatus): number {
  return status === "lost" ? -1 : PIPELINE_STATUSES.indexOf(status) + 1;
}

/**
 * How long a lead may sit in a stage before it counts as a dropped ball.
 *
 * These are deliberately short at the top of the funnel. An unanswered fresh
 * lead goes cold in a day or two, and longer once the work is actually running,
 * because a build in progress is not a ball being dropped.
 */
const STALE_AFTER_DAYS: Record<LeadStatus, number | null> = {
  "fresh-lead": 1,
  "contact-made": 3,
  "discovery-done": 3,
  "quote-sent": 5,
  "quote-accepted": 5,
  "in-progress": 10,
  "client-review": 4,
  iterating: 5,
  complete: null,
  lost: null,
};

export function staleAfterDays(status: LeadStatus): number | null {
  return STALE_AFTER_DAYS[status];
}

/** True when a lead has sat in its current stage longer than it should have. */
export function isStale(status: LeadStatus, daysInStage: number): boolean {
  const limit = STALE_AFTER_DAYS[status];
  return limit !== null && daysInStage > limit;
}
