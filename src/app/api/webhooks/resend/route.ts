/**
 * Resend delivery webhook.
 *
 * This is the endpoint that turns "the message was accepted" into "the message
 * arrived", which is the difference between hoping and knowing. Resend posts one
 * event per state change; each one is folded into the lead that sent it.
 *
 * Two rules govern the responses:
 *
 *  - **Refuse to run without a secret.** An unauthenticated endpoint that writes
 *    to lead records is an endpoint anyone can use to write to lead records.
 *    Failing loudly beats running open.
 *  - **Answer 200 to anything that is not our fault.** A provider that gets a
 *    non-2xx retries for hours. An event about a lead that has since been
 *    deleted, or a message id we have no pointer for, is not an error worth
 *    making Resend retry — it is worth logging.
 */

import { verifySvixSignature } from "@/lib/svix";
import { isBlobConfigured, recordDeliveryEvent } from "@/lib/store";
import { statusFromEvent } from "@/lib/delivery";

export const dynamic = "force-dynamic";

type ResendEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    subject?: string;
    created_at?: string;
    bounce?: { type?: string; subType?: string; message?: string };
    reason?: string;
  };
};

/** Whatever the provider will tell us about why something failed. */
function detailOf(event: ResendEvent): string | undefined {
  const bounce = event.data?.bounce;
  const parts = [bounce?.type, bounce?.subType, bounce?.message ?? event.data?.reason]
    .filter((part): part is string => Boolean(part && part.trim()));
  return parts.length ? parts.join(" — ") : undefined;
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      JSON.stringify({
        event: "resend.webhook.misconfigured",
        message: "RESEND_WEBHOOK_SECRET is not set — refusing to accept unsigned events",
      }),
    );
    return Response.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  // The raw text, before anything parses it. Re-serialising the JSON would
  // change the bytes and every signature would fail.
  const body = await request.text();

  const verified = verifySvixSignature({
    body,
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signature: request.headers.get("svix-signature"),
    secret,
  });

  if (!verified.ok) {
    console.warn(JSON.stringify({ event: "resend.webhook.rejected", reason: verified.reason }));
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: ResendEvent;
  try {
    payload = JSON.parse(body) as ResendEvent;
  } catch {
    // Signed but unparseable. Retrying will not help, so do not ask for one.
    console.warn(JSON.stringify({ event: "resend.webhook.unparseable" }));
    return Response.json({ ok: true, ignored: "unparseable body" });
  }

  const type = payload.type ?? "";
  const messageId = payload.data?.email_id ?? "";
  const at = payload.created_at ?? payload.data?.created_at ?? new Date().toISOString();

  const isEngagement = type === "email.opened" || type === "email.clicked";
  if (!statusFromEvent(type) && !isEngagement) {
    // Say what was skipped and why. A handler that silently drops what it does
    // not recognise is indistinguishable from one that is broken.
    console.log(JSON.stringify({ event: "resend.webhook.ignored", type, messageId }));
    return Response.json({ ok: true, ignored: type || "no type" });
  }

  if (!messageId) {
    console.warn(JSON.stringify({ event: "resend.webhook.no_message_id", type }));
    return Response.json({ ok: true, ignored: "no email_id" });
  }

  if (!isBlobConfigured()) {
    // Nowhere to write it. This one IS our fault, so let Resend retry.
    console.error(JSON.stringify({ event: "resend.webhook.no_store", type, messageId }));
    return Response.json({ error: "Storage is not configured" }, { status: 503 });
  }

  try {
    const result = await recordDeliveryEvent(messageId, { type, at, detail: detailOf(payload) });
    console.log(
      JSON.stringify({
        event: "resend.webhook.received",
        type,
        messageId,
        outcome: result.outcome,
        reference: result.reference,
      }),
    );
    return Response.json({ ok: true, outcome: result.outcome });
  } catch (err) {
    // A storage failure is worth a retry, so this is the one case that 500s.
    console.error(
      JSON.stringify({
        event: "resend.webhook.failed",
        type,
        messageId,
        message: err instanceof Error ? err.message : String(err),
      }),
    );
    return Response.json({ error: "Could not record the event" }, { status: 500 });
  }
}

/**
 * A GET is not part of the webhook, but pointing a browser at the URL to see if
 * it is alive is the first thing anyone does when a webhook is not working.
 * Answer that question without revealing anything.
 */
export async function GET() {
  return Response.json({
    ok: true,
    endpoint: "resend delivery webhook",
    configured: Boolean(process.env.RESEND_WEBHOOK_SECRET),
    storage: isBlobConfigured(),
  });
}
