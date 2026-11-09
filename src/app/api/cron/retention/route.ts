/**
 * Daily clean-up behind the 12-month promise on /privacy.
 *
 * Only counts until RETENTION_DELETE_ENABLED is exactly "true". Logs counts and
 * never names: the run's log line outlives the records it describes.
 */

import { NextResponse } from "next/server";
import { sendOwnerAlert } from "@/lib/email";
import { deleteProspect, listProspects } from "@/lib/prospects";
import { classifyLead, prospectIsDue, retentionCutoff } from "@/lib/retention";
import { deleteLead, isBlobConfigured, listLeadReferences, listLeads } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(JSON.stringify({ event: "cron.retention.misconfigured", message: "CRON_SECRET is not set." }));
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured on this deployment." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    console.warn(JSON.stringify({ event: "cron.retention.unauthorised" }));
    return NextResponse.json({ ok: false, error: "Not authorised." }, { status: 401 });
  }

  const deleting = process.env.RETENTION_DELETE_ENABLED === "true";
  const report = {
    mode: deleting ? "delete" : "dry-run",
    leadsDue: 0,
    prospectsDue: 0,
    leadsDeleted: 0,
    prospectsDeleted: 0,
    projectsKept: 0,
    leadsUnreadable: 0,
  };

  try {
    if (!isBlobConfigured()) throw new Error("Blob storage is not configured.");
    const cutoff = retentionCutoff(new Date());

    const references = await listLeadReferences();
    const leads = await listLeads();
    // A lead that fails to read is skipped, so it can never be deleted blind.
    report.leadsUnreadable = references.length - leads.length;

    for (const lead of leads) {
      const verdict = classifyLead(lead, cutoff);
      if (verdict === "projectKept") report.projectsKept += 1;
      if (verdict !== "due") continue;
      report.leadsDue += 1;
      if (deleting && (await deleteLead(lead.reference))) report.leadsDeleted += 1;
    }

    for (const prospect of await listProspects()) {
      if (!prospectIsDue(prospect, cutoff)) continue;
      report.prospectsDue += 1;
      if (deleting && (await deleteProspect(prospect.id))) report.prospectsDeleted += 1;
    }

    console.log(JSON.stringify({ event: "cron.retention.ran", ...report }));
    return NextResponse.json({ ok: true, ...report });
  } catch (err) {
    // Blob errors can quote a path, and a prospect's path carries the business name.
    const message = (err instanceof Error ? err.message : String(err)).replace(
      /(leads|prospects|access|email-index)\/\S+/g,
      "$1/...",
    );
    console.error(JSON.stringify({ event: "cron.retention.crashed", message, ...report }));
    await sendOwnerAlert(
      "Built By A Real Person: the daily clean-up failed",
      `The retention clean-up did not finish.\n\n${message}\n\nProgress: ${JSON.stringify(report)}`,
    );
    return NextResponse.json({ ok: false, error: message, ...report }, { status: 500 });
  }
}
