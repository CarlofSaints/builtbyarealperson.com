/**
 * Everything that leaves the building by email.
 *
 * Two messages go to the customer, staged rather than fired all at once:
 *   1. Immediately. Confirmation with the PDF estimate attached.
 *   2. A couple of hours later. The booking request for the 30-minute call.
 * A third goes to the owner immediately, with the same PDF.
 *
 * Every send returns its provider message id so a lead record can carry proof
 * of what was accepted. Accepted is not the same as delivered. See the note at
 * the bottom of this file.
 */

import { Resend } from "resend";
import { SITE } from "./site";
import { formatMoney, ACCURACY_BAND, CARE_PLAN } from "./rate-card";
import { groupLines, type Answers, type Estimate } from "./estimate";
import { INTEGRATIONS } from "./rate-card";

const FROM = process.env.EMAIL_FROM || `${SITE.name} <hello@${SITE.domain}>`;
const REPLY_TO = process.env.EMAIL_REPLY_TO || SITE.email;
const OWNER = process.env.NOTIFY_EMAIL || "";

export type SendResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Shared shell ────────────────────────────────────────────────────────── */

const INK = "#0b1220";
const TURQ = "#0f9e8c";
const PINK = "#d9357f";
const BORDER = "#e4e9ee";
const MUTED = "#6b7785";

function shell(opts: { preheader: string; heading: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">

<tr><td style="background:${INK};padding:24px 28px;border-bottom:3px solid ${TURQ};">
  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${TURQ};margin-right:9px;"></span>
  <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:-0.2px;">built by a real person</span>
</td></tr>

<tr><td style="padding:32px 28px 8px;">
  <h1 style="margin:0;font-size:23px;line-height:1.25;color:${INK};font-weight:800;letter-spacing:-0.4px;">${opts.heading}</h1>
</td></tr>

<tr><td style="padding:8px 28px 32px;font-size:15px;line-height:1.62;color:#38424f;">
${opts.body}
</td></tr>

<tr><td style="background:#fafbfc;border-top:1px solid ${BORDER};padding:20px 28px;font-size:12px;line-height:1.6;color:${MUTED};">
  <p style="margin:0 0 6px;"><strong style="color:#38424f;">${esc(SITE.name)}</strong> &middot; ${esc(SITE.builder.location)}</p>
  <p style="margin:0;">
    <a href="https://${esc(SITE.domain)}" style="color:${TURQ};text-decoration:none;">${esc(SITE.domain)}</a>
    &nbsp;&middot;&nbsp;
    <a href="mailto:${esc(SITE.email)}" style="color:${TURQ};text-decoration:none;">${esc(SITE.email)}</a>
  </p>
  <p style="margin:10px 0 0;">You are receiving this because you asked for an estimate on my website. You are not on any mailing list.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0;"><tr>
<td style="background:${TURQ};border-radius:10px;">
<a href="${esc(href)}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${esc(label)}</a>
</td></tr></table>`;
}

/* ── 1. Customer: confirmation + PDF ─────────────────────────────────────── */

export async function sendCustomerEstimate(args: {
  answers: Answers;
  estimate: Estimate;
  reference: string;
  pdf: Uint8Array;
}): Promise<SendResult> {
  const { answers, estimate, reference, pdf } = args;
  const resend = client();
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set" };

  const firstName = answers.name.trim().split(/\s+/)[0] || "there";

  const rows = groupLines(estimate.lines)
    .flatMap((g) => g.lines)
    .map(
      (l) => `<tr>
<td style="padding:9px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:#38424f;">${esc(l.label)}</td>
<td style="padding:9px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};font-weight:600;text-align:right;white-space:nowrap;">${esc(formatMoney(l.amount))}</td>
</tr>`,
    )
    .join("");

  const body = `
<p style="margin:0 0 18px;">Hi ${esc(firstName)},</p>

<p style="margin:0 0 18px;">Thanks for going through the estimator. Your preliminary estimate is attached as a PDF, and here is the short version:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafa;border:1px solid ${BORDER};border-radius:12px;margin:0 0 24px;">
<tr><td style="padding:22px 24px;">
  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};font-weight:700;">Estimated total</p>
  <p style="margin:0;font-size:32px;font-weight:800;color:${INK};letter-spacing:-1px;">${esc(formatMoney(estimate.total))}
    <span style="font-size:13px;font-weight:400;color:${MUTED};">excl. VAT</span></p>
  <p style="margin:10px 0 0;font-size:13px;color:#38424f;">Likely final range: <strong>${esc(formatMoney(estimate.low))} &ndash; ${esc(formatMoney(estimate.high))}</strong><br>
  Estimated build time: <strong>${estimate.daysLow}&ndash;${estimate.daysHigh} working days</strong></p>
</td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
${rows}
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f9;border-left:4px solid ${PINK};border-radius:8px;margin:0 0 26px;">
<tr><td style="padding:18px 20px;">
  <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:${PINK};letter-spacing:0.04em;">THIS IS NOT A QUOTE</p>
  <p style="margin:0;font-size:14px;line-height:1.6;color:#6b2545;">It is a preliminary estimate based only on what you told the form. The fixed quote comes after we have spoken, and it will land <strong>within ${Math.round(ACCURACY_BAND * 100)}%</strong> of the number above. If the job turns out bigger than I judged, that is mine to absorb, not yours to pay.</p>
</td></tr>
</table>

<p style="margin:0 0 18px;"><strong style="color:${INK};">What happens next.</strong> I read every one of these myself. There is no team here and no queue. I will be in touch shortly with a link to book a 30-minute Teams call, where we work out what the site actually needs to do for ${esc(answers.business.trim() || "your business")}. You get a fixed written quote after that.</p>

<p style="margin:0 0 18px;">Nothing is owed and no deposit is taken until you have accepted that quote in writing.</p>

<p style="margin:0 0 6px;">If anything in the attached PDF is wrong, just reply to this email and I will redo it.</p>

<p style="margin:22px 0 0;color:${MUTED};font-size:14px;">${esc(SITE.builder.name)}<br>
<span style="font-size:13px;">Your reference is <strong style="color:${INK};">${esc(reference)}</strong>. Quote it if you write to me.</span></p>
`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: answers.email.trim(),
      replyTo: REPLY_TO,
      subject: `Your website estimate: ${formatMoney(estimate.total)} (${reference})`,
      html: shell({
        preheader: `Estimated ${formatMoney(estimate.total)}, likely final ${formatMoney(estimate.low)}–${formatMoney(estimate.high)}. PDF attached.`,
        heading: "Your preliminary estimate",
        body,
      }),
      text: customerText(answers, estimate, reference),
      attachments: [
        {
          filename: `Estimate-${reference}.pdf`,
          content: Buffer.from(pdf).toString("base64"),
        },
      ],
    });

    if (error) return { ok: false, error: error.message ?? String(error) };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function customerText(answers: Answers, estimate: Estimate, reference: string): string {
  const firstName = answers.name.trim().split(/\s+/)[0] || "there";
  const lines = groupLines(estimate.lines)
    .flatMap((g) => g.lines)
    .map((l) => `  ${l.label}: ${formatMoney(l.amount)}`)
    .join("\n");

  return `Hi ${firstName},

Thanks for going through the estimator. Your preliminary estimate is attached as a PDF.

ESTIMATED TOTAL: ${formatMoney(estimate.total)} (excl. VAT)
Likely final range: ${formatMoney(estimate.low)} - ${formatMoney(estimate.high)}
Estimated build time: ${estimate.daysLow}-${estimate.daysHigh} working days

${lines}

THIS IS NOT A QUOTE. It is a preliminary estimate based only on what you told
the form. The fixed quote comes after we have spoken, and it will land within
${Math.round(ACCURACY_BAND * 100)}% of the number above.

What happens next: I read every one of these myself. I will be in touch shortly
with a link to book a 30-minute Teams call. You get a fixed written quote after
that. Nothing is owed until you accept it.

If anything is wrong, just reply and I will redo it.

- ${SITE.builder.name}
Reference: ${reference}
${SITE.domain}`;
}

/* ── 2. Customer: the booking request, sent later ────────────────────────── */

/** Narrow on purpose: the follow-up quotes the numbers that were stored with
    the lead, not numbers recomputed from a rate card that may have changed
    since. The customer must never see a different figure to the PDF. */
export type StoredFigures = Pick<Estimate, "total" | "low" | "high" | "daysLow" | "daysHigh">;

export async function sendBookingRequest(args: {
  answers: Answers;
  estimate: StoredFigures;
  reference: string;
}): Promise<SendResult> {
  const { answers, estimate, reference } = args;
  const resend = client();
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set" };

  const firstName = answers.name.trim().split(/\s+/)[0] || "there";
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "";

  const cta = bookingUrl
    ? `${button(bookingUrl, "Pick a time that suits you")}
<p style="margin:0 0 18px;font-size:14px;color:${MUTED};">The link shows my actual availability, so whatever you pick is confirmed on the spot. If none of the slots work, just reply with two or three times that do.</p>`
    : `<p style="margin:0 0 18px;">Reply to this email with two or three times that suit you over the next week and I will send a Teams invitation for whichever works.</p>`;

  const body = `
<p style="margin:0 0 18px;">Hi ${esc(firstName)},</p>

<p style="margin:0 0 18px;">I have been through your answers for ${esc(answers.business.trim() || "your business")} properly. The estimate I sent, <strong style="color:${INK};">${esc(formatMoney(estimate.total))}</strong>, still looks about right, and I have a few thoughts on where it could come down.</p>

<p style="margin:0 0 18px;">The next step is a <strong style="color:${INK};">30-minute Teams call</strong>. It is not a sales pitch. It is the conversation where I find out what your business actually does, who buys from you, and what has to happen on this website for it to have been worth the money. I come out of it able to give you a fixed quote instead of an estimate.</p>

${cta}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafa;border:1px solid ${BORDER};border-radius:12px;margin:0 0 24px;">
<tr><td style="padding:20px 22px;">
  <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${INK};">Worth thinking about before we talk</p>
  <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.65;color:#38424f;">
    <li>What do you want somebody to <em>do</em> when they land on the site?</li>
    <li>Which two or three questions do customers always ask you first?</li>
    <li>Is there a website you like the look of? Any industry, it does not have to be yours.</li>
    <li>Do you have photos, or do we need to sort that out?</li>
  </ul>
</td></tr>
</table>

<p style="margin:0 0 18px;">No preparation is required and there is no obligation at the end of it. If it turns out I am not the right fit, I will say so and point you at someone who is.</p>

<p style="margin:22px 0 0;color:${MUTED};font-size:14px;">${esc(SITE.builder.name)}<br>
<span style="font-size:13px;">Reference ${esc(reference)}. The optional care plan, if you were wondering, is ${esc(formatMoney(CARE_PLAN.monthly))} a month and is never bundled into the build price.</span></p>
`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: answers.email.trim(),
      replyTo: REPLY_TO,
      subject: `Shall we put 30 minutes in the diary? (${reference})`,
      html: shell({
        preheader: "The next step is a 30-minute Teams call to turn the estimate into a fixed quote.",
        heading: "Let us talk it through",
        body,
      }),
      text: `Hi ${firstName},

I have been through your answers for ${answers.business.trim() || "your business"} properly. The estimate I sent - ${formatMoney(estimate.total)} - still looks about right.

The next step is a 30-minute Teams call. Not a sales pitch: it is where I find out what your business actually does and what this website has to achieve. I come out of it able to give you a fixed quote instead of an estimate.

${bookingUrl ? `Book a time that suits you: ${bookingUrl}` : "Reply with two or three times that suit you over the next week and I will send a Teams invitation."}

Worth thinking about beforehand:
- What do you want somebody to DO when they land on the site?
- Which two or three questions do customers always ask you first?
- Is there a website you like the look of?
- Do you have photos, or do we need to sort that out?

No preparation required, no obligation at the end.

- ${SITE.builder.name}
Reference: ${reference}`,
    });

    if (error) return { ok: false, error: error.message ?? String(error) };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ── 3. Owner notification ───────────────────────────────────────────────── */

export async function sendOwnerNotification(args: {
  answers: Answers;
  estimate: Estimate;
  reference: string;
  pdf: Uint8Array;
  meta: { userAgent: string; submittedAt: string; elapsedMs: number };
}): Promise<SendResult> {
  const { answers, estimate, reference, pdf, meta } = args;
  const resend = client();
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set" };
  if (!OWNER) return { ok: false, error: "NOTIFY_EMAIL is not set" };

  const integrationLabels =
    answers.integrations
      .map((id) => INTEGRATIONS.find((i) => i.id === id)?.label)
      .filter(Boolean)
      .join(", ") || "None";

  const facts: [string, string][] = [
    ["Business", answers.business],
    ["Contact", `${answers.name} · ${answers.email}${answers.phone ? ` · ${answers.phone}` : ""}`],
    ["Current site", answers.hasSite ? answers.currentUrl || "Yes (no link given)" : "None"],
    ["Domain", answers.domain ?? "not answered"],
    ["Size", answers.siteSize ?? "not answered"],
    ["Selling", answers.sell ?? "not answered"],
    ["Market", answers.market ?? "not answered"],
    ["Integrations", integrationLabels],
    ["Integration detail", answers.integrationsDetail || "not answered"],
    ["Brand", answers.brand ?? "not answered"],
    ["Copy", answers.copy ?? "not answered"],
    ["Second language", answers.multilingual ? "Yes" : "No"],
    ["Migrate content", answers.migrateContent ? "Yes" : "No"],
    ["Timeline", answers.timeline ?? "not answered"],
    ["Notes", answers.notes || "not answered"],
    ["Time on form", `${Math.round(meta.elapsedMs / 1000)}s`],
    ["Submitted", meta.submittedAt],
  ];

  const rows = facts
    .map(
      ([k, v]) => `<tr>
<td style="padding:8px 12px 8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};vertical-align:top;white-space:nowrap;">${esc(k)}</td>
<td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${INK};">${esc(v)}</td>
</tr>`,
    )
    .join("");

  const body = `
<p style="margin:0 0 20px;font-size:15px;">
<strong style="color:${INK};font-size:19px;">${esc(formatMoney(estimate.total))}</strong>
<span style="color:${MUTED};"> &nbsp;(${esc(formatMoney(estimate.low))}&ndash;${esc(formatMoney(estimate.high))}) &nbsp;&middot;&nbsp; ${estimate.daysLow}&ndash;${estimate.daysHigh} days</span>
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>

<p style="margin:24px 0 0;font-size:13px;color:${MUTED};">
The same PDF the customer received is attached. Their booking email goes out automatically a couple of hours from now. Reply before then if you want to say something different.
</p>
<p style="margin:12px 0 0;font-size:13px;">
<a href="mailto:${esc(answers.email)}?subject=${encodeURIComponent(`Re: your website estimate (${reference})`)}" style="color:${TURQ};">Reply to ${esc(answers.name)}</a>
</p>
`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: OWNER,
      replyTo: answers.email.trim(),
      subject: `New lead: ${answers.business}, ${formatMoney(estimate.total)} (${reference})`,
      html: shell({
        preheader: `${answers.business} · ${formatMoney(estimate.total)} · ${answers.email}`,
        heading: `New estimate: ${answers.business}`,
        body,
      }),
      text: facts.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nTotal: ${formatMoney(estimate.total)}\nRef: ${reference}`,
      attachments: [
        {
          filename: `Estimate-${reference}.pdf`,
          content: Buffer.from(pdf).toString("base64"),
        },
      ],
    });

    if (error) return { ok: false, error: error.message ?? String(error) };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/*
 * NOTE ON DELIVERY
 * ----------------
 * A successful return here means Resend ACCEPTED the message, not that anyone
 * received it. The message ids are stored on the lead record so a bounce can be
 * traced back. Wiring the Resend delivery webhook to flip a `delivered` flag on
 * the lead is the next thing worth doing here.
 */
