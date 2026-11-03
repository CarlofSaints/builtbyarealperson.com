/**
 * Prospects: businesses I have made a mock-up for, before they have asked me for anything.
 *
 * Kept apart from leads on purpose. A lead is someone who filled in the
 * estimator and has answers and a total; a prospect has neither, and faking
 * them would put R0 rows into the pipeline value.
 *
 * Three private blobs per prospect, one file each, never a shared index
 * (same reason as leads: a shared file is last-write-wins):
 *   prospects/<id>.json   the record
 *   prospects/<id>.html   the mock-up, served at /preview/<id>
 *   prospects/<id>.img    the screenshot that goes inline in the first email
 */

import { randomBytes } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";

const PREFIX = "prospects/";

/** How long a preview link works. After this /preview/<id> answers 410 Gone. */
export const PREVIEW_DAYS = 30;

export type Prospect = {
  id: string;
  createdAt: string;
  expiresAt: string;
  business: string;
  contactName: string;
  email: string;
  currentUrl: string;
  /** Finishes "I came across your site ...", e.g. "while looking for plumbers in Randburg". */
  foundVia: string;
  screenshotType: string;
  /** The ONE cold email. Set once; a second send is refused. */
  intro?: { sentAt: string; id?: string; error?: string };
  /** Carl's edited email. Absent = the default text. */
  draft?: { subject: string; body: string };
};

/** Lower-case slug plus 8 random hex chars, so preview links cannot be guessed by trying business names. */
export function makeProspectId(business: string): string {
  const slug = business
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "site"}-${randomBytes(4).toString("hex")}`;
}

export const PROSPECT_ID = /^[a-z0-9-]{1,40}-[0-9a-f]{8}$/;

export function isExpired(p: Prospect, now = new Date()): boolean {
  return now.getTime() >= new Date(p.expiresAt).getTime();
}

async function readText(path: string): Promise<string | null> {
  try {
    const r = await get(path, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return await new Response(r.stream).text();
  } catch {
    return null;
  }
}

export async function saveProspect(p: Prospect): Promise<void> {
  await put(`${PREFIX}${p.id}.json`, JSON.stringify(p, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function createProspect(p: Prospect, html: string, screenshot: Uint8Array): Promise<void> {
  const opts = { access: "private" as const, addRandomSuffix: false, cacheControlMaxAge: 0 };
  await put(`${PREFIX}${p.id}.html`, html, { ...opts, contentType: "text/html; charset=utf-8" });
  await put(`${PREFIX}${p.id}.img`, Buffer.from(screenshot), { ...opts, contentType: p.screenshotType });
  // The record last: it is what makes the other two reachable.
  await saveProspect(p);
}

export async function readProspect(id: string): Promise<Prospect | null> {
  if (!PROSPECT_ID.test(id)) return null;
  const text = await readText(`${PREFIX}${id}.json`);
  return text ? (JSON.parse(text) as Prospect) : null;
}

export async function readProspectHtml(id: string): Promise<string | null> {
  return PROSPECT_ID.test(id) ? readText(`${PREFIX}${id}.html`) : null;
}

export async function readProspectScreenshot(id: string): Promise<Buffer | null> {
  if (!PROSPECT_ID.test(id)) return null;
  try {
    const r = await get(`${PREFIX}${id}.img`, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return Buffer.from(await new Response(r.stream).arrayBuffer());
  } catch {
    return null;
  }
}

export async function listProspects(): Promise<Prospect[]> {
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) {
      if (b.pathname.endsWith(".json")) ids.push(b.pathname.slice(PREFIX.length, -".json".length));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const all = await Promise.all(ids.map(readProspect));
  return all
    .filter((p): p is Prospect => p !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteProspect(id: string): Promise<boolean> {
  if (!PROSPECT_ID.test(id)) return false;
  await del([`${PREFIX}${id}.json`, `${PREFIX}${id}.html`, `${PREFIX}${id}.img`]);
  return true;
}

/* ------------------------------------------------------------------ */
/* The preview page                                                    */
/* ------------------------------------------------------------------ */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The banner that says whose work this is. Inline styles only, and placed
 * straight after <body> so a mock-up's own CSS cannot easily hide it.
 */
export function previewBanner(p: Prospect, siteUrl: string): string {
  const until = new Date(p.expiresAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  return `<div role="note" style="position:sticky;top:0;z-index:2147483647;margin:0;padding:10px 16px;background:#0b1220;color:#fff;font:14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;text-align:center;border-bottom:3px solid #2ae8ce;">A concept made by Carl at <a href="${esc(siteUrl)}" target="_blank" rel="noopener" style="color:#2ae8ce;">Built By A Real Person</a> for ${esc(p.business)}. Not affiliated with ${esc(p.business)}. This preview is removed on ${esc(until)}.</div>`;
}

export function withBanner(html: string, banner: string): string {
  const body = /<body[^>]*>/i.exec(html);
  if (!body) return banner + html;
  const at = body.index + body[0].length;
  return html.slice(0, at) + banner + html.slice(at);
}
