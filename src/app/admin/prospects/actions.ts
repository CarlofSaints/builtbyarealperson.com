"use server";

/**
 * Prospect actions. Every export here is a public POST endpoint, so each one
 * checks the session as its first statement (see ../actions.ts).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSignedIn } from "@/lib/admin-auth";
import { isBlobConfigured } from "@/lib/store";
import {
  PREVIEW_DAYS,
  createProspect,
  deleteProspect,
  isExpired,
  listProspects,
  makeProspectId,
  readProspect,
  readProspectScreenshot,
  saveProspect,
} from "@/lib/prospects";
import { sendProspectIntro } from "@/lib/email";

export type ActionResult = { error: string | null };

const MAX_HTML = 3 * 1024 * 1024;
const MAX_SHOT = 900 * 1024;
const SHOT_TYPES = ["image/png", "image/jpeg"];

const Fields = z.strictObject({
  business: z.string().trim().min(1, "Business name is required.").max(120),
  contactName: z.string().trim().max(80),
  email: z.string().trim().toLowerCase().email("That email address does not look right."),
  currentUrl: z.string().trim().url("Their current site must be a full address, starting https://").max(300),
  foundVia: z.string().trim().min(3, "Say where you found them.").max(160),
});

export async function addProspect(formData: FormData): Promise<ActionResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again." };
  if (!isBlobConfigured()) return { error: "Blob storage is not configured." };

  const html = formData.get("html");
  const shot = formData.get("screenshot");
  const text = Object.fromEntries(
    ["business", "contactName", "email", "currentUrl", "foundVia"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = Fields.safeParse(text);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };

  if (!(html instanceof File) || html.size === 0) return { error: "Attach the mock-up as one .html file." };
  if (html.size > MAX_HTML) return { error: "The mock-up is over 3 MB. Host big images elsewhere or shrink them." };
  if (!(shot instanceof File) || shot.size === 0) return { error: "Attach a screenshot for the email." };
  if (!SHOT_TYPES.includes(shot.type)) return { error: "The screenshot must be a PNG or JPG." };
  if (shot.size > MAX_SHOT) return { error: "The screenshot is over 900 KB. Big attachments land in spam." };

  const now = new Date();
  const prospect = {
    id: makeProspectId(parsed.data.business),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PREVIEW_DAYS * 86_400_000).toISOString(),
    ...parsed.data,
    screenshotType: shot.type,
  };
  await createProspect(prospect, await html.text(), new Uint8Array(await shot.arrayBuffer()));
  console.log(JSON.stringify({ event: "prospect.created", id: prospect.id, business: prospect.business }));
  revalidatePath("/admin/prospects");
  return { error: null };
}

/**
 * The one cold email. Refused if this prospect, or anyone else at the same
 * address, has already had one: once is the whole permission we have.
 */
export async function sendIntro(id: string): Promise<ActionResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again." };

  const p = await readProspect(id);
  if (!p) return { error: "Could not read that prospect." };
  if (p.intro?.id) return { error: "Already sent. They get one email, not two." };
  if (isExpired(p)) return { error: "The preview has expired. Add them again with a fresh mock-up." };

  const others = await listProspects();
  if (others.some((o) => o.id !== p.id && o.email === p.email && o.intro?.id)) {
    return { error: `${p.email} has already had an email from you for another mock-up.` };
  }

  const shot = await readProspectScreenshot(id);
  if (!shot) return { error: "The screenshot is missing. Delete and add again." };

  // shortcut: read-modify-write with no lock; fine with one operator and a button that disables while sending.
  const result = await sendProspectIntro({
    to: p.email,
    contactName: p.contactName,
    business: p.business,
    foundVia: p.foundVia,
    screenshot: shot,
    screenshotType: p.screenshotType,
  });
  await saveProspect({ ...p, intro: { sentAt: new Date().toISOString(), id: result.id, error: result.error } });
  console.log(JSON.stringify({ event: "prospect.intro", id, ok: result.ok, error: result.error }));
  revalidatePath("/admin/prospects");
  return { error: result.ok ? null : `Not sent: ${result.error}` };
}

export async function removeProspect(id: string): Promise<ActionResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again." };
  const p = await readProspect(id);
  if (!p) return { error: "Could not read that prospect." };
  await deleteProspect(id);
  // The only trace once the blobs are gone, so a "did I email them?" question stays answerable.
  console.log(JSON.stringify({ event: "prospect.deleted", id, business: p.business, email: p.email, intro: p.intro }));
  revalidatePath("/admin/prospects");
  return { error: null };
}
