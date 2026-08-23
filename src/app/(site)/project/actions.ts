"use server";

/**
 * Adding a change request from the client's own page.
 *
 * The link is the credential, so this takes a token rather than a reference and
 * resolves it the same way the page does. A caller who does not hold a live
 * token gets nothing, and is told nothing about why.
 *
 * It can only ever ADD, and only ever with status "new". Nothing reachable from
 * here can set a price, agree to anything, or mark work done.
 */

import { revalidatePath } from "next/cache";
import { addChangeRequest, isBlobConfigured, leadByAccessToken } from "@/lib/store";
import { tokenFingerprint } from "@/lib/access";

export type AddChangeResult = { ok: boolean; error: string | null };

export async function addChange(token: string, what: string): Promise<AddChangeResult> {
  if (!isBlobConfigured()) return { ok: false, error: "Something is wrong on my side. Email me instead." };

  const text = String(what ?? "").trim();
  if (!text) return { ok: false, error: "Tell me what you would like changed." };
  if (text.length > 2000) return { ok: false, error: "That is a bit long for one request. Split it up or email me." };

  const lead = await leadByAccessToken(String(token ?? ""));
  if (!lead) return { ok: false, error: "This link is no longer working. Email me and I will send a new one." };

  const updated = await addChangeRequest(lead.reference, text, "you", new Date());
  if (!updated) return { ok: false, error: "That did not save. Try again, and tell me if it keeps failing." };

  // The token is never logged whole: a log gets pasted into a chat, and a token
  // in a chat is a working link in a chat.
  console.log(
    JSON.stringify({
      event: "change.requested",
      reference: lead.reference,
      via: tokenFingerprint(String(token)),
      business: lead.answers.business,
    }),
  );

  revalidatePath(`/project/${token}`);
  revalidatePath(`/admin/${lead.reference}`);
  return { ok: true, error: null };
}
