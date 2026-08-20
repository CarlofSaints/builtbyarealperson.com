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
};

function pathFor(reference: string): string {
  return `${PREFIX}${reference}.json`;
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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

/** Read-modify-write. Safe here because only the cron touches a lead after creation. */
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
