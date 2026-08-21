/**
 * Lead storage on Vercel Blob.
 *
 * One file per lead. There is deliberately no shared index.json: appending to
 * a single shared file is last-write-wins, so two people submitting within a
 * second of each other would lose one of the two. `list()` is the index.
 *
 * Leads hold personal information, so every blob is private.
 */

import { get, list, put } from "@vercel/blob";
import type { Answers } from "./estimate";
import type { Estimate } from "./estimate";
import { DEFAULT_STATUS, isLeadStatus, type LeadStatus } from "./pipeline";

const PREFIX = "leads/";

export type LeadRecord = {
  reference: string;
  createdAt: string;
  answers: Answers;
  estimate: {
    total: number;
    low: number;
    high: number;
    subtotal: number;
    surcharge: number;
    daysLow: number;
    daysHigh: number;
    lines: { group: string; label: string; amount: number }[];
  };
  meta: {
    userAgent: string;
    ip: string;
    elapsedMs: number;
    referer: string;
  };
  emails: {
    /** Provider message ids. Accepted, which is not the same as delivered. */
    customerEstimateId?: string;
    customerEstimateError?: string;
    ownerNotifyId?: string;
    ownerNotifyError?: string;
    bookingRequestId?: string;
    bookingRequestError?: string;
    bookingRequestSentAt?: string;
    /** Set when the follow-up has been dealt with, successfully or not. */
    bookingRequestAttempts?: number;
  };

  /**
   * Where the lead is in the pipeline.
   *
   * ABSENT ON PURPOSE for a brand new lead. Absence means "fresh lead, nothing
   * has happened yet", and `leadStatus()` renders it that way. Writing the
   * default in at creation would make "never touched" and "moved back to Fresh
   * Lead by hand" indistinguishable.
   */
  status?: LeadStatus;
  /** When the status last changed. Absent means it has never been changed. */
  statusChangedAt?: string;
  /** Every change, oldest first. The audit trail behind the grid. */
  statusHistory?: { from: LeadStatus; to: LeadStatus; at: string }[];
};

function pathFor(reference: string): string {
  return `${PREFIX}${reference}.json`;
}

/**
 * There are two ways a connected store authenticates, and checking for only one
 * of them would mean leads silently stop being stored.
 *
 *  - OIDC (the default when you connect a store to a project): the SDK uses
 *    `BLOB_STORE_ID` together with a short-lived `VERCEL_OIDC_TOKEN` that Vercel
 *    rotates on every deployment.
 *  - `BLOB_READ_WRITE_TOKEN`: a long-lived static token, used off-Vercel.
 *
 * Either one is enough, so accept either.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function toStoredEstimate(estimate: Estimate): LeadRecord["estimate"] {
  return {
    total: estimate.total,
    low: estimate.low,
    high: estimate.high,
    subtotal: estimate.subtotal,
    surcharge: estimate.surcharge,
    daysLow: estimate.daysLow,
    daysHigh: estimate.daysHigh,
    lines: estimate.lines.map((l) => ({ group: l.group, label: l.label, amount: l.amount })),
  };
}

export async function saveLead(lead: LeadRecord): Promise<string> {
  const { url } = await put(pathFor(lead.reference), JSON.stringify(lead, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
  return url;
}

export async function readLead(reference: string): Promise<LeadRecord | null> {
  try {
    // useCache:false because a lead written seconds ago must read back as it
    // was written. A stale read here would re-send an email that already went.
    const result = await get(pathFor(reference), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as LeadRecord;
  } catch {
    return null;
  }
}

/**
 * Read-modify-write.
 *
 * Two things touch a lead after creation: the follow-up cron (email ids) and
 * the admin portal (status). They write different fields, but this is still a
 * last-write-wins read-modify-write with a window of a few hundred milliseconds.
 * With one operator and an hourly cron that window is not worth locking for;
 * if a second person ever gets a login it will be.
 */
export async function patchLead(
  reference: string,
  patch: (lead: LeadRecord) => LeadRecord,
): Promise<LeadRecord | null> {
  const current = await readLead(reference);
  if (!current) return null;
  const next = patch(current);
  await saveLead(next);
  return next;
}

export async function listLeadReferences(): Promise<string[]> {
  const refs: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const name = blob.pathname.slice(PREFIX.length).replace(/\.json$/i, "");
      if (name) refs.push(name);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return refs;
}

/**
 * Human-readable, unambiguous, and safe in a filename, a URL and an email
 * subject line. Deliberately avoids characters that look alike (0/O, 1/I).
 */
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34679";

export function makeReference(now: Date, random: () => number = Math.random): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  let tail = "";
  for (let i = 0; i < 4; i += 1) {
    tail += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }
  return `BRP-${yy}${mm}-${tail}`;
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

/**
 * The lead's stage, with absence read as "Fresh Lead".
 *
 * Also tolerates a status string that is no longer in the vocabulary — if a
 * stage is ever renamed, an old lead falls back to Fresh Lead and shows up in
 * the grid rather than crashing the page or vanishing from it.
 */
export function leadStatus(lead: LeadRecord): LeadStatus {
  return isLeadStatus(lead.status) ? lead.status : DEFAULT_STATUS;
}

/** When the lead last moved. Falls back to when it arrived. */
export function leadStatusChangedAt(lead: LeadRecord): string {
  return lead.statusChangedAt || lead.createdAt;
}

export async function setLeadStatus(
  reference: string,
  to: LeadStatus,
  now: Date,
): Promise<LeadRecord | null> {
  return patchLead(reference, (lead) => {
    const from = leadStatus(lead);
    if (from === to) return lead;
    return {
      ...lead,
      status: to,
      statusChangedAt: now.toISOString(),
      statusHistory: [...(lead.statusHistory ?? []), { from, to, at: now.toISOString() }],
    };
  });
}

/**
 * Every lead, newest first.
 *
 * There is no index file to read (see the note at the top), so this is one blob
 * read per lead. Fetched in batches rather than all at once so a busy month does
 * not open a hundred sockets in parallel. If this ever gets slow enough to
 * notice, the fix is a summary index written alongside each lead — not a shared
 * index.json, which loses writes.
 */
export async function listLeads(): Promise<LeadRecord[]> {
  const refs = await listLeadReferences();
  const leads: LeadRecord[] = [];
  const BATCH = 12;

  for (let i = 0; i < refs.length; i += BATCH) {
    const batch = await Promise.all(refs.slice(i, i + BATCH).map((ref) => readLead(ref)));
    for (const lead of batch) {
      if (lead) leads.push(lead);
    }
  }

  leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return leads;
}
