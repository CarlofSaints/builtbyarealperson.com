import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin-auth";
import { isBlobConfigured, leadStatus, readLead } from "@/lib/store";
import { toRow } from "@/lib/lead-view";
import { PIPELINE_STATUSES, STATUS_META, pipelinePosition } from "@/lib/pipeline";
import {
  BRAND_STATES,
  COPY_MODES,
  DOMAIN_STATES,
  INTEGRATIONS,
  MARKETS,
  SELL_MODES,
  SITE_SIZES,
  TIMELINES,
  formatMoney,
} from "@/lib/rate-card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { DeleteLead } from "@/components/admin/DeleteLead";

export const dynamic = "force-dynamic";

function label<T extends { id: string; label: string }>(list: T[], id: string | null): string {
  if (!id) return "Not answered";
  return list.find((c) => c.id === id)?.label ?? id;
}

function when(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-ZA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadPage({ params }: { params: Promise<{ reference: string }> }) {
  if (!(await isSignedIn())) redirect("/admin/login");
  if (!isBlobConfigured()) redirect("/admin");

  const { reference } = await params;
  const lead = await readLead(reference);
  if (!lead) notFound();

  const row = toRow(lead, new Date());
  const status = leadStatus(lead);
  const a = lead.answers;
  // null for Lost, which is an outcome rather than a place on the bar.
  const position = pipelinePosition(status);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
        <Link href="/admin" className="text-sm text-muted hover:text-turq">
          &larr; Back to the pipeline
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
              {a.name || "(no name given)"}
            </h1>
            {a.business && <p className="mt-1 text-lg text-muted">{a.business}</p>}
            <p className="mt-1 font-mono text-xs text-muted-2">
              {lead.reference} &middot; arrived {when(lead.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold text-turq">{row.totalLabel}</div>
            <div className="text-xs text-muted-2">
              {row.bandLabel} &middot; {row.daysLabel}
            </div>
          </div>
        </div>

        {/* Stage */}
        <section className="mt-7 rounded-xl2 border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-2">
                Stage
              </h2>
              <p className="mt-1 text-sm text-muted">{STATUS_META[status].meaning}</p>
            </div>
            <StatusSelect reference={lead.reference} status={status} />
          </div>

          {/* Progress through the nine forward stages. Lost has no place on it. */}
          <ol className="mt-5 flex gap-1" aria-label="Pipeline position">
            {PIPELINE_STATUSES.map((id, index) => (
              <li
                key={id}
                title={STATUS_META[id].label}
                className={`h-1.5 flex-1 rounded-full ${
                  position !== null && index < position ? STATUS_META[status].dot : "bg-line"
                }`}
              />
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted-2">
            {position === null
              ? "Not in the pipeline"
              : `Stage ${position} of ${PIPELINE_STATUSES.length}`}{" "}
            &middot; here since {when(row.statusChangedAt)}
            {row.stale && <span className="ml-2 font-semibold text-amber-300">— overdue</span>}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {a.email && (
              <a
                href={`mailto:${a.email}?subject=${encodeURIComponent(`Your website estimate (${lead.reference})`)}`}
                className="rounded-xl bg-turq px-4 py-2 font-display text-sm font-semibold text-ink"
              >
                Email {a.email}
              </a>
            )}
            {row.whatsapp && (
              <a
                href={`https://wa.me/${row.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-emerald-400/50 px-4 py-2 font-display text-sm font-semibold text-emerald-300"
              >
                WhatsApp {a.phone}
              </a>
            )}
            {!row.whatsapp && a.phone && (
              <a
                href={`tel:${a.phone}`}
                className="rounded-xl border border-line-2 px-4 py-2 font-display text-sm font-semibold text-text"
              >
                Call {a.phone}
              </a>
            )}
          </div>
        </section>

        {/* What they asked for */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="What they asked for">
            <Row label="Site size" value={label(SITE_SIZES, a.siteSize)} />
            <Row label="Selling online" value={label(SELL_MODES, a.sell)} />
            <Row
              label="Integrations"
              value={
                a.integrations.length
                  ? a.integrations.map((id) => INTEGRATIONS.find((i) => i.id === id)?.label ?? id).join(", ")
                  : "None"
              }
            />
            {a.integrationsDetail.trim() && (
              <Row label="Integration detail" value={a.integrationsDetail} />
            )}
            <Row label="Who they sell to" value={label(MARKETS, a.market)} />
            <Row label="Branding" value={label(BRAND_STATES, a.brand)} />
            <Row label="Words" value={label(COPY_MODES, a.copy)} />
            <Row label="Domain" value={label(DOMAIN_STATES, a.domain)} />
            <Row label="More than one language" value={a.multilingual ? "Yes" : "No"} />
            <Row
              label="Timeline"
              value={TIMELINES.find((t) => t.id === a.timeline)?.label ?? "Not answered"}
            />
            <Row
              label="Existing site"
              value={
                a.hasSite === null
                  ? "Not answered"
                  : a.hasSite
                    ? `${a.currentUrl || "Yes"}${a.migrateContent ? " — wants content moved across" : ""}`
                    : "No"
              }
            />
          </Panel>

          <Panel title="The estimate, line by line">
            <ul className="space-y-1.5 text-sm">
              {lead.estimate.lines.map((line, index) => (
                <li key={`${line.label}-${index}`} className="flex justify-between gap-4">
                  <span className="text-muted">
                    <span className="text-muted-2">{line.group}</span> &middot; {line.label}
                  </span>
                  <span className="whitespace-nowrap font-mono text-text">
                    {formatMoney(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-mono text-text">{formatMoney(lead.estimate.subtotal)}</dd>
              </div>
              {lead.estimate.surcharge > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Rush surcharge</dt>
                  <dd className="font-mono text-text">{formatMoney(lead.estimate.surcharge)}</dd>
                </div>
              )}
              <div className="flex justify-between font-display font-bold">
                <dt className="text-text">Total</dt>
                <dd className="text-turq">{formatMoney(lead.estimate.total)}</dd>
              </div>
            </dl>
          </Panel>

          {a.notes.trim() && (
            <Panel title="What they told you">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{a.notes}</p>
            </Panel>
          )}

          <Panel title="Emails">
            <Row
              label="Estimate + PDF"
              value={
                lead.emails.customerEstimateError
                  ? `FAILED — ${lead.emails.customerEstimateError}`
                  : lead.emails.customerEstimateId || "Not sent"
              }
              tone={lead.emails.customerEstimateError ? "bad" : "plain"}
            />
            <Row
              label="Your notification"
              value={
                lead.emails.ownerNotifyError
                  ? `FAILED — ${lead.emails.ownerNotifyError}`
                  : lead.emails.ownerNotifyId || "Not sent"
              }
              tone={lead.emails.ownerNotifyError ? "bad" : "plain"}
            />
            <Row
              label="Booking request"
              value={
                lead.emails.bookingRequestError
                  ? `FAILED — ${lead.emails.bookingRequestError}`
                  : lead.emails.bookingRequestId
                    ? `Sent ${when(lead.emails.bookingRequestSentAt)}`
                    : "Not sent yet"
              }
              tone={lead.emails.bookingRequestError ? "bad" : "plain"}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted-2">
              These are provider message ids. They prove the message was accepted, not that anyone
              received it. Nothing here can currently tell you it was delivered.
            </p>
          </Panel>

          <Panel title="Stage history">
            {lead.statusHistory?.length ? (
              <ol className="space-y-2 text-sm">
                {[...lead.statusHistory].reverse().map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="flex flex-wrap gap-x-2 text-muted">
                    <span className="text-muted-2">{when(entry.at)}</span>
                    <span>
                      {STATUS_META[entry.from]?.label ?? entry.from} &rarr;{" "}
                      <span className="font-semibold text-text">
                        {STATUS_META[entry.to]?.label ?? entry.to}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">
                Never moved. Still where it landed when the form came in.
              </p>
            )}
          </Panel>

          <Panel title="How they got here">
            <Row label="Referrer" value={lead.meta.referer || "Typed or unknown"} />
            <Row
              label="Time on form"
              value={
                lead.meta.elapsedMs ? `${Math.round(lead.meta.elapsedMs / 1000)} seconds` : "—"
              }
            />
            <Row label="IP" value={lead.meta.ip || "—"} />
            <Row label="Browser" value={lead.meta.userAgent || "—"} />
          </Panel>
        </div>

        {/* Deleting is last on the page and visually separated on purpose: it is
            the one control here that cannot be undone. */}
        <section className="mt-6 rounded-xl2 border border-line bg-surface p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-2">
            Delete
          </h2>
          <p className="mb-4 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            For test submissions and duplicates. A real enquiry that came to nothing belongs in{" "}
            <strong className="text-text">Lost</strong> instead — it stays out of the open pipeline
            but you keep the record of who asked and what for.
          </p>
          <DeleteLead
            reference={lead.reference}
            who={a.name || a.business}
            variant="panel"
            onDeleted="back-to-list"
          />
        </section>
      </main>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl2 border border-line bg-surface p-5">
      <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value, tone = "plain" }: { label: string; value: string; tone?: "plain" | "bad" }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 border-b border-line/50 py-2 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`max-w-[62%] break-words text-right ${tone === "bad" ? "text-pink" : "text-text"}`}>
        {value}
      </span>
    </div>
  );
}
