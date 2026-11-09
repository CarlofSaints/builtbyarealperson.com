/**
 * What the daily clean-up may delete. Pure, so scripts/check-retention.mts can
 * exercise every rule without touching the store.
 *
 * An allowlist on purpose: a status nobody listed here is kept, never deleted.
 */

import type { LeadRecord } from "./store";
import type { Prospect } from "./prospects";

const NEVER_WON = new Set<string>(["fresh-lead", "contact-made", "discovery-done", "quote-sent", "lost"]);

export function retentionCutoff(now: Date): Date {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  return cutoff;
}

/** True only when every sign says this never became a project. */
function neverWon(lead: LeadRecord): boolean {
  if (lead.status !== undefined && !NEVER_WON.has(lead.status)) return false;
  // A lead marked Lost after its quote was accepted is still a client record.
  if (lead.statusHistory?.some((h) => !NEVER_WON.has(h.from) || !NEVER_WON.has(h.to))) return false;
  return !lead.takeOn && !lead.review && !lead.changes?.length && !lead.waitingOn?.length;
}

export function classifyLead(lead: LeadRecord, cutoff: Date): "due" | "projectKept" | null {
  const last = new Date(lead.statusChangedAt || lead.createdAt).getTime();
  // An unreadable date is never old enough to delete.
  if (!(last < cutoff.getTime())) return null;
  return neverWon(lead) ? "due" : "projectKept";
}

export function prospectIsDue(prospect: Prospect, cutoff: Date): boolean {
  const last = new Date(prospect.intro?.sentAt || prospect.createdAt).getTime();
  return last < cutoff.getTime();
}
