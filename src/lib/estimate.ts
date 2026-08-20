/**
 * The estimate engine.
 *
 * One pure function turns a set of answers into line items and a total. It is
 * imported by the browser (live running total), by the PDF generator and by the
 * notification email, so the three can never disagree with each other.
 */

import {
  ACCURACY_BAND,
  BRAND_STATES,
  COPY_MODES,
  DOMAIN_STATES,
  INTEGRATIONS,
  INTEGRATION_ADDITIONAL,
  INTEGRATION_FIRST,
  MARKETS,
  MIGRATION,
  MULTILINGUAL,
  RUSH_SURCHARGE,
  SELL_MODES,
  SITE_SIZES,
  type BrandState,
  type Choice,
  type CopyMode,
  type DomainState,
  type IntegrationId,
  type Market,
  type SellMode,
  type SiteSize,
  type Timeline,
} from "./rate-card";

export type Answers = {
  /* the build */
  siteSize: SiteSize | null;
  sell: SellMode | null;
  integrations: IntegrationId[];
  integrationsDetail: string;
  market: Market | null;
  brand: BrandState | null;
  copy: CopyMode | null;

  /* what exists today */
  hasSite: boolean | null;
  currentUrl: string;
  migrateContent: boolean;
  domain: DomainState | null;

  /* extras */
  multilingual: boolean;
  timeline: Timeline | null;

  /* who they are */
  name: string;
  business: string;
  email: string;
  phone: string;
  notes: string;

  /* anti-spam: must stay empty */
  website: string;
};

export const EMPTY_ANSWERS: Answers = {
  siteSize: null,
  sell: null,
  integrations: [],
  integrationsDetail: "",
  market: null,
  brand: null,
  copy: null,
  hasSite: null,
  currentUrl: "",
  migrateContent: false,
  domain: null,
  multilingual: false,
  timeline: null,
  name: "",
  business: "",
  email: "",
  phone: "",
  notes: "",
  website: "",
};

export type LineItem = {
  /** Grouping used by the PDF and the on-screen breakdown. */
  group: "Build" | "Selling" | "Integrations" | "Design & words" | "Domain" | "Extras" | "Timing";
  label: string;
  detail?: string;
  amount: number;
  /** True for a percentage line such as the rush surcharge. */
  isSurcharge?: boolean;
};

export type Estimate = {
  lines: LineItem[];
  subtotal: number;
  surcharge: number;
  total: number;
  /** The honest band we promise the final quote will land inside. */
  low: number;
  high: number;
  /** Working-day range, derived from what they picked. */
  daysLow: number;
  daysHigh: number;
  /** True once enough is answered for the number to mean anything. */
  isPriceable: boolean;
};

function find<T extends string>(list: Choice<T>[], id: T | null): Choice<T> | null {
  if (!id) return null;
  return list.find((c) => c.id === id) ?? null;
}

/** Rough working-day estimate, driven by the same answers as the price. */
function estimateDays(a: Answers): [number, number] {
  const base: Record<SiteSize, [number, number]> = {
    landing: [3, 5],
    brochure: [5, 8],
    standard: [8, 14],
    large: [14, 25],
  };
  let [lo, hi] = a.siteSize ? base[a.siteSize] : [5, 8];

  if (a.sell === "simple") { lo += 2; hi += 4; }
  if (a.sell === "full") { lo += 4; hi += 8; }

  const n = a.integrations.length;
  lo += n * 1;
  hi += n * 3;

  if (a.brand === "need-all") { lo += 3; hi += 6; }
  if (a.brand === "have-logo") { lo += 1; hi += 2; }
  if (a.copy === "written") { lo += 2; hi += 4; }
  if (a.migrateContent) { lo += 1; hi += 3; }
  if (a.multilingual) { lo += 2; hi += 4; }
  if (a.market === "intl") { lo += 1; hi += 3; }

  // Waiting on a third party to move DNS is the classic silent delay.
  if (a.domain === "own-no-access") { hi += 5; }

  if (a.timeline === "rush") {
    lo = Math.max(2, Math.round(lo * 0.7));
    hi = Math.max(lo + 1, Math.round(hi * 0.7));
  }

  return [lo, hi];
}

export function calculateEstimate(a: Answers): Estimate {
  const lines: LineItem[] = [];

  /* 1. Base build */
  const size = find(SITE_SIZES, a.siteSize);
  if (size) {
    lines.push({
      group: "Build",
      label: size.label,
      detail: size.blurb,
      amount: size.price,
    });
  }

  /* 2. Selling */
  const sell = find(SELL_MODES, a.sell);
  if (sell && sell.price > 0) {
    lines.push({
      group: "Selling",
      label: sell.label,
      detail: sell.blurb,
      amount: sell.price,
    });
  }

  /* 3. Integrations — first one costs more because it carries the plumbing */
  a.integrations.forEach((id, index) => {
    const def = INTEGRATIONS.find((i) => i.id === id);
    if (!def) return;
    const amount = index === 0 ? INTEGRATION_FIRST : INTEGRATION_ADDITIONAL;
    lines.push({
      group: "Integrations",
      label: def.label,
      detail:
        index === 0
          ? "Connection, authentication, field mapping and error handling."
          : "Additional connection, priced lower because the plumbing already exists.",
      amount,
    });
  });

  /* 4. Design and words */
  const brand = find(BRAND_STATES, a.brand);
  if (brand && brand.price > 0) {
    lines.push({
      group: "Design & words",
      label: brand.label,
      detail: brand.blurb,
      amount: brand.price,
    });
  }

  const copy = find(COPY_MODES, a.copy);
  if (copy && copy.price > 0) {
    lines.push({
      group: "Design & words",
      label: copy.label,
      detail: copy.blurb,
      amount: copy.price,
    });
  }

  /* 5. Domain */
  const domain = find(DOMAIN_STATES, a.domain);
  if (domain && domain.price > 0) {
    lines.push({
      group: "Domain",
      label: domain.label,
      detail: domain.blurb,
      amount: domain.price,
    });
  }

  /* 6. Extras */
  if (a.migrateContent) {
    lines.push({
      group: "Extras",
      label: MIGRATION.label,
      detail: MIGRATION.blurb,
      amount: MIGRATION.price,
    });
  }

  const market = find(MARKETS, a.market);
  if (market && market.price > 0) {
    lines.push({
      group: "Extras",
      label: market.label,
      detail: market.blurb,
      amount: market.price,
    });
  }

  if (a.multilingual) {
    lines.push({
      group: "Extras",
      label: MULTILINGUAL.label,
      detail: MULTILINGUAL.blurb,
      amount: MULTILINGUAL.price,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  /* 7. Rush, as a percentage of everything above it */
  let surcharge = 0;
  if (a.timeline === "rush" && subtotal > 0) {
    surcharge = Math.round(subtotal * RUSH_SURCHARGE);
    lines.push({
      group: "Timing",
      label: `Priority build (+${Math.round(RUSH_SURCHARGE * 100)}%)`,
      detail:
        "You go to the front of the queue and other work moves aside to make room.",
      amount: surcharge,
      isSurcharge: true,
    });
  }

  const total = subtotal + surcharge;
  const [daysLow, daysHigh] = estimateDays(a);

  return {
    lines,
    subtotal,
    surcharge,
    total,
    low: Math.round((total * (1 - ACCURACY_BAND)) / 50) * 50,
    high: Math.round((total * (1 + ACCURACY_BAND)) / 50) * 50,
    daysLow,
    daysHigh,
    // The base build is the only answer that has to exist for a number to mean
    // anything — everything else is an addition to it.
    isPriceable: Boolean(a.siteSize),
  };
}

/** Groups in the order they should be printed. */
export const GROUP_ORDER: LineItem["group"][] = [
  "Build",
  "Selling",
  "Integrations",
  "Design & words",
  "Domain",
  "Extras",
  "Timing",
];

export function groupLines(lines: LineItem[]): { group: string; lines: LineItem[]; total: number }[] {
  return GROUP_ORDER.map((group) => {
    const group_lines = lines.filter((l) => l.group === group);
    return {
      group,
      lines: group_lines,
      total: group_lines.reduce((s, l) => s + l.amount, 0),
    };
  }).filter((g) => g.lines.length > 0);
}
