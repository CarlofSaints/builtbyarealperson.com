"use server";

/**
 * Saving the take-on questionnaire.
 *
 * DELIBERATELY PUBLIC. The customer filling this in has no login and should not
 * need one — a questionnaire behind a password is a questionnaire nobody fills
 * in. The protections are that it writes exactly one field on exactly one lead,
 * it will not create a lead that does not exist, and it refuses to overwrite an
 * answer that has already been given. Someone who guesses a reference can
 * answer a questionnaire once. That is the whole blast radius.
 */

import { readLead, saveTakeOn } from "@/lib/store";
import { EMPTY_TAKE_ON, QUESTIONS, recommend, type TakeOnAnswers } from "@/lib/take-on";

export type TakeOnResult = { ok: boolean; error: string | null };

/** Only the ids the questionnaire defines, only the values it offers. */
function sanitise(input: unknown): TakeOnAnswers | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const out: TakeOnAnswers = { ...EMPTY_TAKE_ON };

  for (const q of QUESTIONS) {
    const value = raw[q.id];
    if (typeof value !== "string") return null;
    if (!q.choices.some((c) => c.id === value)) return null;
    (out as Record<string, unknown>)[q.id] = value;
  }
  for (const key of ["currentHostingWho", "domainWho", "notes"] as const) {
    const value = raw[key];
    // Trimmed and capped: free text from an unauthenticated form is the one
    // thing here that a stranger controls the size of.
    out[key] = typeof value === "string" ? value.trim().slice(0, 600) : "";
  }
  return out;
}

export async function submitTakeOn(reference: string, input: unknown): Promise<TakeOnResult> {
  const ref = String(reference || "").trim();
  if (!ref) return { ok: false, error: "Something went wrong. Please use the link I sent you." };

  const answers = sanitise(input);
  if (!answers) return { ok: false, error: "Please answer every question before sending." };

  const lead = await readLead(ref);
  if (!lead) return { ok: false, error: "I could not find that. Please use the link I sent you." };
  if (lead.takeOn) return { ok: true, error: null };

  const { plan } = recommend(answers, lead.answers);
  const saved = await saveTakeOn(ref, answers, plan, new Date());
  if (!saved) return { ok: false, error: "That did not save. Try again, and tell me if it keeps failing." };

  console.log(
    JSON.stringify({ event: "takeon.submitted", reference: ref, plan, business: lead.answers.business }),
  );
  return { ok: true, error: null };
}
