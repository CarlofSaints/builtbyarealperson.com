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

import { leadByAccessToken, saveTakeOn } from "@/lib/store";
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

export async function submitTakeOn(token: string, input: unknown): Promise<TakeOnResult> {
  const answers = sanitise(input);
  if (!answers) return { ok: false, error: "Please answer every question before sending." };

  // The link is the credential, so this resolves the same way the page does.
  // A caller without a live token is told nothing about why it failed.
  const lead = await leadByAccessToken(String(token ?? ""));
  if (!lead) return { ok: false, error: "This link is no longer working. Email me and I will send a new one." };
  if (lead.takeOn) return { ok: true, error: null };
  const ref = lead.reference;

  const { plan } = recommend(answers, lead.answers);
  const saved = await saveTakeOn(ref, answers, plan, new Date());
  if (!saved) return { ok: false, error: "That did not save. Try again, and tell me if it keeps failing." };

  console.log(
    JSON.stringify({ event: "takeon.submitted", reference: ref, plan, business: lead.answers.business }),
  );
  return { ok: true, error: null };
}

/* ------------------------------------------------------------------ */
/* The review, asked at handover                                       */
/* ------------------------------------------------------------------ */

import { saveReview } from "@/lib/store";
import { CONSENT_CHOICES, type Review, type ReviewConsent } from "@/lib/review";

export type ReviewResult = { ok: boolean; error: string | null };

export async function submitReview(
  token: string,
  input: { stars: number; quote: string; consent: string; attributionName: string; privateNote: string },
): Promise<ReviewResult> {
  const stars = Number(input?.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, error: "Pick between one and five stars." };
  }
  if (!CONSENT_CHOICES.some((c) => c.id === input?.consent)) {
    return { ok: false, error: "Let me know whether I may use this." };
  }

  const lead = await leadByAccessToken(String(token ?? ""));
  if (!lead) return { ok: false, error: "This link is no longer working. Email me and I will send a new one." };
  if (lead.review) return { ok: true, error: null };
  const ref = lead.reference;

  const review: Review = {
    stars,
    // Capped: free text from an unauthenticated form is the one thing here a
    // stranger controls the size of.
    quote: String(input.quote ?? "").trim().slice(0, 1200),
    consent: input.consent as ReviewConsent,
    attributionName: String(input.attributionName ?? "").trim().slice(0, 120),
    privateNote: String(input.privateNote ?? "").trim().slice(0, 1200),
    at: new Date().toISOString(),
  };

  const saved = await saveReview(ref, review);
  if (!saved) return { ok: false, error: "That did not save. Try again, and tell me if it keeps failing." };

  // A low score is the one that must never be missed in a log.
  console.log(
    JSON.stringify({
      event: "review.submitted",
      reference: ref,
      stars,
      consent: review.consent,
      business: lead.answers.business,
      needsAttention: stars <= 3,
    }),
  );
  return { ok: true, error: null };
}
