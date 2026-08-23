/**
 * Work I have already built, used as proof that a website can do more than sit
 * there.
 *
 * The framing matters more than the content. A page headed "my portfolio of
 * enterprise systems" tells a plumber that this is not for him and costs a
 * sale. The same entries headed "what a site can do once it stops being a
 * brochure" turn an abstract line on the rate card — "Integrations, R4,500
 * first" — into something a person can picture. So every entry ends with what
 * the equivalent costs here. An entry that ends with a capability is a CV; one
 * that ends with a number is a sales page.
 *
 * PERMISSION IS NOT ASSUMED. Only businesses where permission genuinely exists
 * appear by name. Everything else stays out entirely rather than going in
 * anonymised, because a description specific enough to be useful is usually
 * specific enough to identify.
 *
 * No client screenshots. Someone else's live figures on my marketing site is a
 * bad day for both of us.
 */

export type Capability =
  | "bookings"
  | "logins"
  | "documents"
  | "accounting"
  | "data"
  | "mobile"
  | "notifications";

export const CAPABILITY_LABELS: Record<Capability, string> = {
  bookings: "Bookings and calendars",
  logins: "Logins and permissions",
  documents: "Documents and printing",
  accounting: "Accounting and payments",
  data: "Importing and reporting",
  mobile: "Built for phones",
  notifications: "Automatic emails",
};

export type Project = {
  slug: string;
  /** Named only where permission genuinely exists. */
  client: string;
  /** What the reader should take from it, in their words not mine. */
  headline: string;
  /** The problem before it existed. People buy the problem, not the software. */
  problem: string;
  does: string[];
  capabilities: Capability[];
  /** Ties it back to the rate card. Without this it is a CV. */
  costsHere: string;
  live: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: "colab-hub",
    client: "COLAB",
    headline: "A staff hub that talks to the accounting system",
    problem:
      "Invoices were raised in one place and retyped into the accounts in another, which is where the mistakes came from. Questions about a job lived in WhatsApp, where nobody could find them a month later.",
    does: [
      "Billing raised in the hub goes through to Xero, so the same figure is never typed twice",
      "Staff message each other inside the system, against the thing they are talking about, so the conversation stays with the job",
      "Sign in with a one-time code sent to your email, so there is no password to forget",
      "Different people see different things: finance sees the money, staff see their own work",
      "A shared calendar for the things people book, so two people cannot take the same slot",
      "A QR sticker anyone can scan to report a fault, with no login and no app to install",
      "Emails that send themselves when something needs attention, instead of somebody remembering",
    ],
    capabilities: ["accounting", "logins", "bookings", "notifications", "mobile"],
    costsHere:
      "Connecting a site to accounting software is the clearest example of what an integration is, and it is priced as one.",
    live: true,
  },
  {
    slug: "cubana-register",
    client: "Cubana Properties",
    headline: "One place for every property, tenant and project",
    problem:
      "The information lived in spreadsheets, inboxes and somebody's memory. Answering a simple question about a tenant meant asking three people.",
    does: [
      "Every property, tenant, project and director in one register that stays current",
      "Proof of payment generated and emailed straight from the record it belongs to",
      "Searchable, so a question takes seconds rather than a morning",
    ],
    capabilities: ["data", "documents", "notifications"],
    costsHere:
      "A private area behind a login, holding your own records rather than public pages, is quoted as an integration.",
    live: true,
  },
  {
    slug: "iram-flow",
    client: "iRam",
    headline: "Warehouse returns tracked from the door to the credit note",
    problem:
      "Stock coming back was counted on paper. Nobody could say what had arrived, what it was worth, or which box a given item was in.",
    does: [
      "Goods booked in against the receipt they arrived on, with the value carried through",
      "Barcoded labels printed for every box, so a carton can be found later",
      "Reports that come out as a spreadsheet the warehouse actually uses",
    ],
    capabilities: ["data", "documents"],
    costsHere:
      "Printing, barcodes and spreadsheet exports are all integrations. Most sites need none of it, and it is priced separately for exactly that reason.",
    live: true,
  },
  {
    slug: "iram-routes",
    client: "iRam",
    headline: "Sales rounds planned by the map instead of by habit",
    problem:
      "Reps worked out their own routes, which meant driving past three customers to reach a fourth, and no way to see whether a store had been visited at all.",
    does: [
      "Every rep's calls plotted and ordered by where they actually are",
      "Routes regenerated when the customer list changes, rather than rewritten by hand",
      "A record of who was visited and when, so a missed store is visible",
    ],
    capabilities: ["data", "mobile"],
    costsHere: "Anything that talks to a mapping service is an integration on the rate card.",
    live: true,
  },
];

/** Capabilities actually represented, in the order the labels are declared. */
export function capabilitiesInUse(): Capability[] {
  const used = new Set(PROJECTS.flatMap((p) => p.capabilities));
  return (Object.keys(CAPABILITY_LABELS) as Capability[]).filter((c) => used.has(c));
}
