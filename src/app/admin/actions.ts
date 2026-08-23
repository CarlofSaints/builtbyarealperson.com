"use server";

/**
 * Admin server actions.
 *
 * EVERY export of a "use server" file is a public POST endpoint. It does not
 * matter that the only form calling it is rendered behind a login — the action
 * id is in the client bundle and can be posted to directly. So each action does
 * its own authorisation check as its first statement, and none of them leak
 * information to a caller who fails it.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminConfigProblem,
  checkPassword,
  endSession,
  isSignedIn,
  startSession,
} from "@/lib/admin-auth";
import { deleteLead, isBlobConfigured, setLeadStatus } from "@/lib/store";
import { isLeadStatus } from "@/lib/pipeline";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const problem = adminConfigProblem();
  if (problem === "no-password") {
    return { error: "ADMIN_PASSWORD is not set on this deployment, so nobody can sign in." };
  }
  if (problem === "weak-password") {
    return { error: "ADMIN_PASSWORD is shorter than 12 characters. Set a longer one." };
  }
  if (problem === "no-secret") {
    return { error: "ADMIN_SESSION_SECRET is not set, so a session cannot be signed." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter the password." };

  if (!checkPassword(password)) {
    // Slow every failure down a little. It does not stop a determined attacker
    // on serverless — there is no shared counter between instances — but it
    // does make an unattended dictionary run meaningfully more expensive.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "That is not the password." };
  }

  await startSession(new Date());
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  // No auth check needed to sign OUT — the worst an unauthenticated caller can
  // do is delete their own cookie.
  await endSession();
  redirect("/admin/login");
}

export type StatusResult = { error: string | null };

/**
 * Move a lead to a stage.
 *
 * Takes plain arguments rather than FormData so the picker can call it inside a
 * transition and drive an optimistic update — a form submission would fight the
 * transition and leave the control showing a stage that was never stored.
 */
export async function updateLeadStatus(
  reference: string,
  status: string,
): Promise<StatusResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again." };
  if (!isBlobConfigured()) return { error: "Blob storage is not configured." };

  const ref = reference.trim();
  if (!ref) return { error: "No lead reference." };
  if (!isLeadStatus(status)) return { error: `Unknown status "${status}".` };

  const updated = await setLeadStatus(ref, status, new Date());
  if (!updated) return { error: `Lead ${ref} could not be read back.` };

  revalidatePath("/admin");
  revalidatePath(`/admin/${ref}`);
  return { error: null };
}

export type DeleteResult = { error: string | null; deleted: string | null };

/**
 * Delete a lead for good.
 *
 * Irreversible — there is no trash to restore from. The confirmation lives in
 * the UI, but the reference is checked against the stored record here too, so a
 * mistyped or stale reference deletes nothing rather than something else.
 *
 * What went is written to the function logs before it disappears, because after
 * this returns that line is the only record the lead ever existed.
 */
export async function deleteLeadAction(reference: string): Promise<DeleteResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again.", deleted: null };
  if (!isBlobConfigured()) return { error: "Blob storage is not configured.", deleted: null };

  const ref = reference.trim();
  if (!ref) return { error: "No lead reference.", deleted: null };

  const gone = await deleteLead(ref);
  if (!gone) return { error: `Lead ${ref} was not found. Nothing was deleted.`, deleted: null };

  console.log(
    JSON.stringify({
      event: "lead.deleted",
      reference: gone.reference,
      createdAt: gone.createdAt,
      name: gone.answers.name,
      business: gone.answers.business,
      email: gone.answers.email,
      total: gone.estimate.total,
      at: new Date().toISOString(),
    }),
  );

  revalidatePath("/admin");
  revalidatePath(`/admin/${ref}`);
  return { error: null, deleted: gone.reference };
}

/* ------------------------------------------------------------------ */
/* The client's project page                                           */
/* ------------------------------------------------------------------ */

import { accessTokenFor, readLead, rotateAccessToken, setWaitingOn, updateChangeRequest } from "@/lib/store";
import type { ChangeStatus } from "@/lib/project";
import { SITE } from "@/lib/site";

export type LinkResult = { url: string | null; error: string | null };

/** Mint the link if it does not exist yet, or hand back the one that does. */
export async function getProjectLink(reference: string): Promise<LinkResult> {
  if (!(await isSignedIn())) return { url: null, error: "Signed out." };
  const token = await accessTokenFor(reference);
  if (!token) return { url: null, error: "Could not read that lead." };
  return { url: `${SITE.url}/project/${token}`, error: null };
}

/** Kill the old link and issue a new one. The old one stops working at once. */
export async function rotateProjectLink(reference: string): Promise<LinkResult> {
  if (!(await isSignedIn())) return { url: null, error: "Signed out." };
  const token = await rotateAccessToken(reference);
  if (!token) return { url: null, error: "Could not rotate that link." };
  console.log(JSON.stringify({ event: "project.link.rotated", reference }));
  revalidatePath(`/admin/${reference}`);
  return { url: `${SITE.url}/project/${token}`, error: null };
}

export type ChangeResult = { error: string | null };

export async function triageChange(
  reference: string,
  id: string,
  status: string,
  priceText: string,
  note: string,
): Promise<ChangeResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again." };

  const allowed: ChangeStatus[] = ["new", "in-the-build", "quoted", "done", "not-doing"];
  if (!allowed.includes(status as ChangeStatus)) return { error: `Unknown status "${status}".` };

  // An empty box means "no price", which is different from a price of zero:
  // zero is a deliberate "no charge" the customer sees.
  const trimmed = String(priceText ?? "").trim();
  let price: number | null | undefined = null;
  if (trimmed) {
    const parsed = Number(trimmed.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) return { error: "That price is not a number." };
    price = Math.round(parsed);
  }

  const updated = await updateChangeRequest(reference, id, {
    status: status as ChangeStatus,
    price,
    note: String(note ?? ""),
  });
  if (!updated) return { error: "Could not save that." };

  revalidatePath(`/admin/${reference}`);
  return { error: null };
}

/**
 * One thing per line. A repeater UI would be more work for both of us.
 *
 * The date on each line is PRESERVED where the wording has not changed. The
 * value of this feature is entirely in "since the 3rd" — stamping today's date
 * every time I tidy the list would quietly reset the clock on exactly the thing
 * it exists to measure.
 */
export async function saveWaitingOn(reference: string, text: string): Promise<ChangeResult> {
  if (!(await isSignedIn())) return { error: "Signed out. Reload and sign in again." };

  const lead = await readLead(reference);
  if (!lead) return { error: "Could not read that lead." };
  const existing = new Map((lead.waitingOn ?? []).map((w) => [w.what, w]));
  const now = new Date();

  // Declared rather than inlined: this file has already been mangled once by
  // an escaping layer, and a named constant is harder to corrupt silently.
  const SPLIT_LINES = /\r?\n/;

  const items = String(text ?? "")
    .split(SPLIT_LINES)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((what, i) => {
      const trimmed = what.slice(0, 300);
      const kept = existing.get(trimmed);
      return kept ?? { id: `${now.getTime().toString(36)}-${i}`, what: trimmed, since: now.toISOString() };
    });

  const updated = await setWaitingOn(reference, items);
  if (!updated) return { error: "Could not save that." };
  revalidatePath(`/admin/${reference}`);
  return { error: null };
}
