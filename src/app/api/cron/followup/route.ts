/**
 * The second customer email — the one that asks for 30 minutes.
 *
 * It is deliberately not sent with the first. Three emails landing in a
 * stranger's inbox inside one minute reads as an automated sequence, which is
 * the exact impression this business exists to avoid.
 *
 * Runs on a schedule (see vercel.json). Every run logs a summary line, including
 * the runs that do nothing — a cron that quietly stopped firing is invisible
 * otherwise, and you only find out when the leads dry up.
 */

import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { sendBookingRequest } from "@/lib/email";
import { isBlobConfigured, patchLead, readLead } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const DEFAULT_DELAY_MINUTES = 120;
const MAX_ATTEMPTS = 3;
/** Anything older than this was either handled or is not worth chasing. */
const LOOKBACK_DAYS = 14;

function delayMinutes(): number {
  const raw = Number(process.env.FOLLOWUP_DELAY_MINUTES);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_DELAY_MINUTES;
}

export async function GET(request: Request) {
  const startedAt = Date.now();

  // A guard whose secret is missing is not a guard — it is an endpoint that has
  // never actually been protected and never told anyone. Fail loudly.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(
      JSON.stringify({
        event: "cron.followup.misconfigured",
        message: "CRON_SECRET is not set. Refusing to run rather than running unauthenticated.",
      }),
    );
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured on this deployment." },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    console.warn(JSON.stringify({ event: "cron.followup.unauthorised" }));
    return NextResponse.json({ ok: false, error: "Not authorised." }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    console.error(JSON.stringify({ event: "cron.followup.misconfigured", message: "No blob credentials: neither BLOB_STORE_ID (OIDC) nor BLOB_READ_WRITE_TOKEN is set" }));
    return NextResponse.json({ ok: false, error: "Blob storage is not configured." }, { status: 500 });
  }

  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  const cutoff = Date.now() - delayMinutes() * 60_000;
  const lookback = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60_000;

  const report = {
    scanned: 0,
    considered: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    references: [] as string[],
    errors: [] as string[],
  };

  try {
    let cursor: string | undefined;

    do {
      const page = await list({ prefix: "leads/", cursor, limit: 1000 });
      cursor = page.hasMore ? page.cursor : undefined;

      for (const blob of page.blobs) {
        report.scanned += 1;

        // uploadedAt comes back with the listing, so most leads are ruled out
        // without a read.
        if (blob.uploadedAt.getTime() < lookback) continue;

        const reference = blob.pathname.replace(/^leads\//, "").replace(/\.json$/i, "");
        if (!reference) continue;

        const lead = await readLead(reference);
        if (!lead) {
          report.errors.push(`${reference}: could not be read back`);
          continue;
        }

        if (lead.emails.bookingRequestSentAt) continue;
        if ((lead.emails.bookingRequestAttempts ?? 0) >= MAX_ATTEMPTS) {
          report.skipped += 1;
          continue;
        }
        if (new Date(lead.createdAt).getTime() > cutoff) continue;

        report.considered += 1;

        if (dryRun) {
          report.references.push(reference);
          continue;
        }

        const result = await sendBookingRequest({
          answers: lead.answers,
          estimate: {
            total: lead.estimate.total,
            low: lead.estimate.low,
            high: lead.estimate.high,
            daysLow: lead.estimate.daysLow,
            daysHigh: lead.estimate.daysHigh,
          },
          reference,
        });

        await patchLead(reference, (current) => ({
          ...current,
          emails: {
            ...current.emails,
            bookingRequestAttempts: (current.emails.bookingRequestAttempts ?? 0) + 1,
            ...(result.ok
              ? { bookingRequestId: result.id, bookingRequestSentAt: new Date().toISOString(), bookingRequestError: undefined }
              : { bookingRequestError: result.error }),
          },
        }));

        if (result.ok) {
          report.sent += 1;
          report.references.push(reference);
        } else {
          report.failed += 1;
          // Record WHY. A loop that moves past a bad record without saying what
          // was wrong is undiagnosable the moment it matters.
          report.errors.push(`${reference}: ${result.error}`);
        }
      }
    } while (cursor);

    console.log(
      JSON.stringify({
        event: "cron.followup.ran",
        durationMs: Date.now() - startedAt,
        delayMinutes: delayMinutes(),
        dryRun,
        ...report,
      }),
    );

    return NextResponse.json({ ok: true, dryRun, ...report });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "cron.followup.crashed", durationMs: Date.now() - startedAt, message, ...report }),
    );
    return NextResponse.json({ ok: false, error: message, ...report }, { status: 500 });
  }
}
