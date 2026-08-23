/**
 * Work I have already built, used as proof that a website can do more than sit
 * there.
 *
 * The framing matters more than the content. A page headed "my portfolio of
 * enterprise systems" tells a plumber that this is not for him and costs a
 * sale. The same entries headed "what a site can do once it stops being a
 * brochure" turn an abstract line on the rate card, "Integrations, R4,500
 * first", into something a person can picture. So every entry ends with what
 * the equivalent costs here. An entry that ends with a capability is a CV; one
 * that ends with a number is a sales page.
 *
 * PERMISSION IS NOT ASSUMED. Only businesses where permission genuinely exists
 * appear by name. Everything else stays out entirely rather than going in
 * anonymised, because a description specific enough to be useful is usually
 * specific enough to identify.
 *
 * Screenshots are of the real, working systems, with the data swapped out in
 * the browser before the picture was taken. Names, figures, addresses, staff,
 * barcodes and account references are all replaced; the layout and the
 * behaviour are untouched. Nothing was saved and nothing was sent. Somebody
 * else's live figures on my marketing site is a bad day for both of us, and a
 * blurred-out screenshot looks like something to hide, so neither happens.
 *
 * Money and quantities are moved by ONE factor per screen rather than
 * individually, so the columns still add up. Jittered numbers that do not
 * total correctly read as fake even when nothing real is left in them.
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
  /**
   * Only where the public can actually go and use the thing.
   *
   * The rest are internal tools behind a login: a link would either 404 for the
   * reader or expose somebody's staff system, and neither builds any trust. The
   * absence of a link is honest rather than a gap.
   */
  url?: string;
  /**
   * Anonymised captures of the real thing. A caption per image, because a
   * screenshot with no caption asks the reader to work out what they are
   * looking at, and they will not bother.
   */
  shots?: { src: string; caption: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "price-my-prang",
    client: "Price My Prang",
    headline: "A public site where strangers get quotes for accident damage",
    problem:
      "Getting your car repaired meant ringing round panel beaters one at a time, describing the damage badly over the phone, and having no idea whether the price you were given was fair.",
    does: [
      "Anybody can arrive, photograph the damage on their phone and send it, with no account and no app",
      "The job goes out to panel beaters, who quote against the same pictures rather than a description",
      "Quotes come back in one place to be compared, instead of arriving as five phone calls",
      "Everyone is kept up to date by email as it moves, without anybody chasing",
    ],
    capabilities: ["data", "notifications", "mobile"],
    url: "https://pricemyprang.co.za",
    costsHere:
      "This is the far end of what a website can be. Most businesses need nothing like it, but if you have ever thought your site could take the job rather than just describe it, this is what that looks like.",
    live: true,
  },
  {
    slug: "colab-hub",
    shots: [
      { src: "/work/colab-hub/billing.jpg", caption: "The month's costs split across four businesses sharing one building, ready to invoice." },
      { src: "/work/colab-hub/xero.jpg", caption: "Connected to Xero, so a figure raised here is never retyped into the accounts." },
      { src: "/work/colab-hub/chat.jpg", caption: "Staff messaging built into the system itself, instead of living in WhatsApp." },
      { src: "/work/colab-hub/room-bookings.jpg", caption: "Meeting rooms for the week. Click an empty slot to take it, click a booking to ask for it." },
      { src: "/work/colab-hub/team.jpg", caption: "Everyone across the building, tagged by parking bay, keys, phone licence and first aid." },
    ],

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
    shots: [
      { src: "/work/cubana-register/properties.jpg", caption: "Every property with its value, bond and equity, and the full record one click away." },
      { src: "/work/cubana-register/tenants.jpg", caption: "Who is in each property, on what lease, and when it runs out." },
      { src: "/work/cubana-register/reminders.jpg", caption: "Recurring emails that send themselves, so the council and the levies are never late." },
      { src: "/work/cubana-register/dashboard.jpg", caption: "What needs attention today: renewals, expiring leases and anything overdue." },
    ],

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
    shots: [
      { src: "/work/iram-flow/process.jpg", caption: "The whole job, from loading a spreadsheet to a signed delivery note filed automatically." },
      { src: "/work/iram-flow/aged-stock.jpg", caption: "Thirty thousand lines of returned stock, filterable by client, store, barcode or product." },
      { src: "/work/iram-flow/picking-slips.jpg", caption: "Every picking slip and where it has got to, across a thousand of them." },
      { src: "/work/iram-flow/audit-log.jpg", caption: "Who did what and when. Every scan, receipt and release, kept." },
      { src: "/work/iram-flow/guide.jpg", caption: "A written user guide inside the system, so a new starter is not somebody else's afternoon." },
    ],

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
    shots: [
      { src: "/work/iram-routes/map.jpg", caption: "Every store the reps cover, plotted. The whole footprint on one screen instead of in a spreadsheet." },
      { src: "/work/iram-routes/stores.jpg", caption: "The store list behind the map: who calls there, how often, and for how long." },
      { src: "/work/iram-routes/reps.jpg", caption: "The reps, their teams and where each one starts the day, which is what the routing works from." },
      { src: "/work/iram-routes/capacity.jpg", caption: "Who is over capacity and who has room, so the fix is reshuffling rather than hiring." },
    ],

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
