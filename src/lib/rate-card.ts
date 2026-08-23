/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE RATE CARD — single source of truth.
 *
 *  Every price shown on the website, in the live estimator and in the emailed
 *  PDF comes from this file. Change a number here and it changes everywhere.
 *  Nothing else in the codebase should contain a rand amount.
 *
 *  All amounts are in ZAR, excluding VAT.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CURRENCY_PREFIX = "R";

/** Final quote is promised to land within this fraction of the estimate. */
export const ACCURACY_BAND = 0.2;

/** Optional monthly care plan — quoted separately, never inside the total. */
export const CARE_PLAN = {
  monthly: 450,
  label: "Care plan (optional)",
  blurb:
    "Hosting, security updates, daily backups, uptime monitoring and up to 30 minutes of small tweaks a month. Cancel any time. You keep the site either way.",
};

/**
 * Hosting position, shown as a note rather than a line item.
 *
 * The old wording offered hosting "free on my account", which contradicted the
 * ownership promise everywhere else on the site: a site on my plan is a site
 * you cannot take with you, however willingly I would hand it over. Most sites
 * here do not need a paid platform at all, so the honest version is that the
 * arrangement is a decision we make together, and the domain and the code are
 * yours regardless of it.
 */
export const HOSTING_NOTE =
  "Hosting for the first year is included. Most sites here run on hosting that costs nothing or close to it, often on something you already pay for. Where a site needs more, it is roughly R0 to R250 a month. We decide together whose account it lives in, and I will show you the numbers before you commit.";

/**
 * What "you own it" actually means, boundary included.
 *
 * Read literally, "you own the code" hands every client the reusable components
 * and tooling that make this business possible. The line below is the standard
 * split, and it is on the site rather than buried in terms because it is the
 * kind of thing that should not be a surprise.
 */
export const OWNERSHIP_NOTE =
  "Your domain, your site, your content and your accounts are yours outright, and stay yours whether or not you carry on working with me. What I keep is the reusable toolkit underneath: the components and build setup I use across every project. You are not buying a share of my tools, and I am not taking a share of your website.";

export type Money = number;

export type Choice<T extends string> = {
  id: T;
  label: string;
  blurb: string;
  price: Money;
};

/* ── 1. Base build — how big is the site ─────────────────────────────────── */

export type SiteSize = "landing" | "brochure" | "standard" | "large";

export const SITE_SIZES: Choice<SiteSize>[] = [
  {
    id: "landing",
    label: "One-page site",
    blurb:
      "A single scrolling page: what you do, why you, and how to reach you. Ideal for one clear offer.",
    price: 5500,
  },
  {
    id: "brochure",
    label: "Small site (4 to 5 pages)",
    blurb:
      "Home, About, Services, Contact and one more. The size most small businesses actually need.",
    price: 9500,
  },
  {
    id: "standard",
    label: "Standard site (6 to 12 pages)",
    blurb:
      "Separate pages per service, team, case studies, a news or blog section.",
    price: 16500,
  },
  {
    id: "large",
    label: "Large site (12+ pages)",
    blurb:
      "Bigger structure, custom sections, member or client area, more moving parts.",
    price: 26000,
  },
];

/* ── 2. Selling online ───────────────────────────────────────────────────── */

export type SellMode = "no" | "simple" | "full";

export const SELL_MODES: Choice<SellMode>[] = [
  {
    id: "no",
    label: "No, the site is there to get enquiries",
    blurb: "People find you, understand you, and contact you.",
    price: 0,
  },
  {
    id: "simple",
    label: "A small catalogue",
    blurb:
      "Up to about 20 products or services, with an enquiry or a pay-by-link checkout. No stock tracking.",
    price: 7500,
  },
  {
    id: "full",
    label: "A proper online shop",
    blurb:
      "Cart, secure checkout (Payfast, Yoco or Stripe), stock levels, order confirmations and delivery options.",
    price: 14000,
  },
];

/* ── 3. Integrations ─────────────────────────────────────────────────────── */

/** First integration costs this; each one after it costs the lower rate. */
export const INTEGRATION_FIRST: Money = 4500;
export const INTEGRATION_ADDITIONAL: Money = 3500;

export const INTEGRATIONS = [
  { id: "xero", label: "Xero" },
  { id: "sage", label: "Sage / Pastel" },
  { id: "quickbooks", label: "QuickBooks" },
  { id: "microsoft", label: "SharePoint / Microsoft 365" },
  { id: "monday", label: "Monday.com" },
  { id: "crm", label: "HubSpot / Zoho / other CRM" },
  { id: "mailer", label: "Mailchimp / email marketing" },
  { id: "sheets", label: "Google Sheets or Drive" },
  { id: "whatsapp", label: "WhatsApp Business" },
  { id: "booking", label: "Online booking or calendar" },
  { id: "pos", label: "Inventory or point-of-sale" },
  { id: "other", label: "Something else" },
] as const;

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];

/* ── 4. Market reach ─────────────────────────────────────────────────────── */

export type Market = "sa" | "intl";

export const MARKETS: Choice<Market>[] = [
  {
    id: "sa",
    label: "South Africa only",
    blurb: "Rands, local delivery, local tax.",
    price: 0,
  },
  {
    id: "intl",
    label: "South Africa and abroad",
    blurb:
      "More than one currency, international delivery zones, foreign tax rules and time zones.",
    price: 3500,
  },
];

/* ── 5. Brand and design ─────────────────────────────────────────────────── */

export type BrandState = "have-all" | "have-logo" | "need-all";

export const BRAND_STATES: Choice<BrandState>[] = [
  {
    id: "have-all",
    label: "I have a logo and brand guidelines",
    blurb: "Colours, fonts and rules already exist. I build to them.",
    price: 0,
  },
  {
    id: "have-logo",
    label: "I have a logo, nothing else",
    blurb:
      "I design a colour palette, type scale and full component set around your existing logo.",
    price: 3500,
  },
  {
    id: "need-all",
    label: "I need the lot designed",
    blurb:
      "Logo, colour palette, typography and a one-page brand sheet you can use everywhere else too.",
    price: 8500,
  },
];

/* ── 6. Words ────────────────────────────────────────────────────────────── */

export type CopyMode = "supplied" | "written";

export const COPY_MODES: Choice<CopyMode>[] = [
  {
    id: "supplied",
    label: "I will send you the text",
    blurb:
      "You supply the words for each page. I lay them out and tidy the grammar.",
    price: 0,
  },
  {
    id: "written",
    label: "Please write it for me",
    blurb:
      "I interview you, then write the words for up to six pages. You approve every line before it goes live.",
    price: 3000,
  },
];

/* ── 7. Domain ───────────────────────────────────────────────────────────── */

export type DomainState = "own-access" | "own-no-access" | "need-domain";

export const DOMAIN_STATES: Choice<DomainState>[] = [
  {
    id: "own-access",
    label: "I own it and I can change its settings",
    blurb:
      "Nothing to do. I hand you two records to paste in, or you give me access for ten minutes.",
    price: 0,
  },
  {
    id: "own-no-access",
    label: "I own it but someone else controls it",
    blurb:
      "I chase the third party, explain what is needed and verify it went live correctly. This is usually the slowest part of any project.",
    price: 1500,
  },
  {
    id: "need-domain",
    label: "I do not have a domain yet",
    blurb:
      "I check what is available, register it in your name and cover the first year.",
    price: 950,
  },
];

/* ── 8. Add-ons ──────────────────────────────────────────────────────────── */

export const MIGRATION: Choice<"migrate"> = {
  id: "migrate",
  label: "Move content from the old site",
  blurb:
    "Pages, text and images carried across and cleaned up, so nothing is lost and your Google ranking survives the move.",
  price: 2500,
};

export const MULTILINGUAL: Choice<"multilingual"> = {
  id: "multilingual",
  label: "A second language",
  blurb: "The whole site in a second language, with a switcher.",
  price: 4500,
};

/* ── 9. Timeline ─────────────────────────────────────────────────────────── */

export type Timeline = "flexible" | "soon" | "rush";

/** Rush is a percentage of the subtotal, not a flat fee. */
export const RUSH_SURCHARGE = 0.2;

export const TIMELINES: { id: Timeline; label: string; blurb: string }[] = [
  {
    id: "flexible",
    label: "No particular rush",
    blurb: "Slot me into the normal queue.",
  },
  {
    id: "soon",
    label: "Within the next month",
    blurb: "The usual turnaround. No surcharge.",
  },
  {
    id: "rush",
    label: "As fast as humanly possible",
    blurb:
      "You go to the front of the queue and I clear other work to do it. Adds " +
      Math.round(RUSH_SURCHARGE * 100) +
      "%.",
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Deterministic on purpose. `toLocaleString` differs between the browser and a
 * Node server with a trimmed ICU build, which would cause a hydration mismatch
 * on the live total and a PDF that disagrees with the screen.
 */
export function formatMoney(amount: number): string {
  const n = Math.round(Math.abs(amount));
  const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${amount < 0 ? "-" : ""}${CURRENCY_PREFIX}${grouped}`;
}

/** The lowest number we can honestly put on the homepage. */
export const FROM_PRICE = Math.min(...SITE_SIZES.map((s) => s.price));
