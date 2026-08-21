/**
 * Turns a stored lead into the flat shape the admin grid renders.
 *
 * Kept out of the components so the table, the cards and the detail page all
 * describe a lead the same way, and so nothing but plain JSON crosses the
 * server/client boundary.
 */

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
} from "./rate-card";
import type { LeadRecord } from "./store";
import { leadStatus, leadStatusChangedAt } from "./store";
import { isStale, type LeadStatus } from "./pipeline";

export type LeadRow = {
  reference: string;
  status: LeadStatus;
  createdAt: string;
  statusChangedAt: string;
  /** Whole days the lead has sat in its current stage. */
  daysInStage: number;
  daysSinceArrival: number;
  /** True when it has sat there longer than that stage allows. */
  stale: boolean;

  name: string;
  business: string;
  email: string;
  /** As typed. */
  phone: string;
  /** International form for a wa.me link, or "" if it could not be normalised. */
  whatsapp: string;

  total: number;
  totalLabel: string;
  bandLabel: string;
  daysLabel: string;

  /** Short human summary of what they asked for. */
  wants: string;
  timeline: string;
  hasNotes: boolean;

  /** True when the confirmation email came back with an error. */
  emailFailed: boolean;
  bookingSent: boolean;
};

const DAY = 86_400_000;

function label<T extends { id: string; label: string }>(list: T[], id: string | null): string {
  if (!id) return "";
  return list.find((c) => c.id === id)?.label ?? id;
}

function wholeDaysBetween(from: string, to: Date): number {
  const start = Date.parse(from);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((to.getTime() - start) / DAY));
}

/**
 * South African mobile numbers get typed every possible way: `082 123 4567`,
 * `+27 82 123 4567`, `0027821234567`, with brackets, dots or dashes. wa.me
 * needs digits only, in international form with no plus.
 *
 * Returns "" rather than a guess when the number is not a recognisable SA
 * mobile — a wrong wa.me link opens a chat with a stranger.
 */
export function toWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("0027")) return `27${digits.slice(4)}`;
  if (digits.startsWith("27") && digits.length === 11) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `27${digits.slice(1)}`;
  // Already international and not SA — trust it if it is a plausible length.
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
}

function describeWants(lead: LeadRecord): string {
  const a = lead.answers;
  const parts: string[] = [];

  const size = label(SITE_SIZES, a.siteSize);
  if (size) parts.push(size);

  const sell = label(SELL_MODES, a.sell);
  if (sell && a.sell !== "no") parts.push(sell);

  if (a.integrations.length) {
    const names = a.integrations
      .map((id) => INTEGRATIONS.find((i) => i.id === id)?.label ?? id)
      .join(", ");
    parts.push(names);
  }

  const brand = label(BRAND_STATES, a.brand);
  if (brand) parts.push(brand);

  const copy = label(COPY_MODES, a.copy);
  if (copy) parts.push(copy);

  const domain = label(DOMAIN_STATES, a.domain);
  if (domain) parts.push(domain);

  const market = label(MARKETS, a.market);
  if (market) parts.push(market);

  if (a.multilingual) parts.push("More than one language");
  if (a.hasSite) parts.push(a.migrateContent ? "Replacing a site, moving content" : "Replacing a site");

  return parts.join(" · ");
}

export function toRow(lead: LeadRecord, now: Date): LeadRow {
  const status = leadStatus(lead);
  const changedAt = leadStatusChangedAt(lead);
  const daysInStage = wholeDaysBetween(changedAt, now);
  const e = lead.estimate;

  return {
    reference: lead.reference,
    status,
    createdAt: lead.createdAt,
    statusChangedAt: changedAt,
    daysInStage,
    daysSinceArrival: wholeDaysBetween(lead.createdAt, now),
    stale: isStale(status, daysInStage),

    name: lead.answers.name,
    business: lead.answers.business,
    email: lead.answers.email,
    phone: lead.answers.phone,
    whatsapp: toWhatsAppNumber(lead.answers.phone),

    total: e.total,
    totalLabel: formatMoney(e.total),
    bandLabel: `${formatMoney(e.low)} – ${formatMoney(e.high)}`,
    daysLabel: e.daysLow === e.daysHigh ? `${e.daysLow} days` : `${e.daysLow}–${e.daysHigh} days`,

    wants: describeWants(lead),
    timeline: TIMELINES.find((t) => t.id === lead.answers.timeline)?.label ?? "",
    hasNotes: Boolean(lead.answers.notes.trim()),

    emailFailed: Boolean(lead.emails.customerEstimateError),
    bookingSent: Boolean(lead.emails.bookingRequestId),
  };
}
