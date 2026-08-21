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
import { isBlobConfigured, setLeadStatus } from "@/lib/store";
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
