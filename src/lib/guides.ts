/**
 * Plain-language guides for the questions small business owners type into
 * Google. Each one answers a single search in full and sends the reader on to
 * the estimator, so it is both a way in from search and proof of the pitch.
 *
 * Every rand amount here is read from the rate card, and every worked example
 * is priced by calculateEstimate(), the same function the estimator and the PDF
 * use. A guide can therefore never quote a number the estimator disagrees with.
 * Do not type a price into this file.
 */

import { calculateEstimate, EMPTY_ANSWERS, type Answers } from "./estimate";
import {
  ACCURACY_BAND,
  BRAND_STATES,
  CARE_PLAN,
  COPY_MODES,
  DOMAIN_STATES,
  FROM_PRICE,
  INTEGRATION_ADDITIONAL,
  INTEGRATION_FIRST,
  MIGRATION,
  OFFERED_SITE_SIZES,
  RUSH_SURCHARGE,
  SELL_MODES,
  formatMoney,
  type Choice,
} from "./rate-card";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  /** A priced worked example. The lines and total come from calculateEstimate(). */
  | { type: "example"; title: string; who: string; answers: Partial<Answers> };

export type Guide = {
  slug: string;
  /** the question the page is built to rank for, used as the H1 */
  title: string;
  /** browser tab and Google result title, kept under about 60 characters */
  metaTitle: string;
  description: string;
  published: string;
  updated: string;
  /** the short answer, right under the title, for readers and for Google's snippet */
  answer: string;
  body: Block[];
  faq: { q: string; a: string }[];
  /** other guides worth reading next */
  related: string[];
};

const m = formatMoney;

function price<T extends string>(list: Choice<T>[], id: T): string {
  const c = list.find((x) => x.id === id);
  if (!c) throw new Error(`guides.ts: no rate card entry "${id}"`);
  return m(c.price);
}

const SIZE = (id: "brochure" | "standard" | "large") => price(OFFERED_SITE_SIZES, id);

export function priceExample(answers: Partial<Answers>) {
  return calculateEstimate({ ...EMPTY_ANSWERS, market: "sa", timeline: "soon", ...answers });
}

/** Working days for a set of answers, from the estimator's own timing rules. */
function days(answers: Partial<Answers>): string {
  const e = priceExample(answers);
  return `${e.daysLow} to ${e.daysHigh}`;
}

/** How many days one choice adds on top of a 4 to 5 page site. */
function addsDays(extra: Partial<Answers>): string {
  const base = priceExample({ siteSize: "brochure" });
  const e = priceExample({ siteSize: "brochure", ...extra });
  return `${e.daysLow - base.daysLow} to ${e.daysHigh - base.daysHigh}`;
}

const RUSH = `${Math.round(RUSH_SURCHARGE * 100)}%`;
const BAND = `${Math.round(ACCURACY_BAND * 100)}%`;

const EX_TRADE: Partial<Answers> = { siteSize: "brochure", sell: "no", brand: "have-logo", copy: "written", domain: "own-access" };
const EX_FROM_NOTHING: Partial<Answers> = { siteSize: "brochure", sell: "no", brand: "need-all", copy: "written", domain: "need-domain" };
const EX_CATALOGUE: Partial<Answers> = { siteSize: "brochure", sell: "simple", brand: "have-logo", copy: "supplied", domain: "own-access" };
const EX_BOOKING: Partial<Answers> = {
  siteSize: "standard",
  sell: "no",
  integrations: ["booking", "xero"],
  brand: "have-all",
  copy: "supplied",
  domain: "own-access",
};

export const GUIDES: Guide[] = [
  {
    slug: "how-much-does-a-website-cost-in-south-africa",
    title: "How much does a website cost in South Africa?",
    metaTitle: "How Much Does a Website Cost in South Africa? Real Prices",
    description: `What a small business website really costs in South Africa, with real published prices. A 4 to 5 page site from ${m(FROM_PRICE)}, what pushes the price up, and four worked examples.`,
    published: "2026-10-14",
    updated: "2026-10-14",
    answer: `A 4 to 5 page website for a South African small business costs ${SIZE("brochure")} with me, excluding VAT. A 6 to 12 page site is ${SIZE("standard")}. The price goes up for three things above all: selling online, connecting the site to other systems, and having the design and the words done for you. Agency quotes for the same site often come in at several times that, and the difference is mostly who else is being paid.`,
    body: [
      { type: "h2", text: "Why website prices are so hard to compare" },
      {
        type: "p",
        text: "Ask five web designers for a price and you will get five numbers that are miles apart, usually after a call, and usually after being asked what your budget is. That is not because some of them are crooks. It is because \"a website\" can mean a single page someone puts together from a template in an afternoon, or a booking system that talks to your accounting software. Until you know which one you are being quoted for, the numbers mean nothing.",
      },
      {
        type: "p",
        text: "So instead of a range, here is what actually moves the price, with the number next to each one. These are the same figures my estimator uses, and they are all published on the pricing page.",
      },
      { type: "h2", text: "What moves the price" },
      {
        type: "ul",
        items: [
          `How many pages. A 4 to 5 page site (home, about, services, contact and one more) is ${SIZE("brochure")}. Separate pages for every service, a team page and case studies take it to ${SIZE("standard")}. A large site with a member or client area is ${SIZE("large")}.`,
          `Selling online. A small catalogue with a pay-by-link checkout adds ${price(SELL_MODES, "simple")}. A proper shop with a cart, stock levels and delivery options adds ${price(SELL_MODES, "full")}. Taking money brings in security, tax and stock, which a brochure site never has to think about.`,
          `Connecting to other systems, such as Xero, a booking calendar or your CRM. The first connection is ${m(INTEGRATION_FIRST)} and each one after it is ${m(INTEGRATION_ADDITIONAL)}, because the groundwork is already done.`,
          `Design. If you have brand guidelines, I build to them at no charge. A logo and nothing else adds ${price(BRAND_STATES, "have-logo")}. A logo, colours and fonts designed from scratch adds ${price(BRAND_STATES, "need-all")}.`,
          `The words. If you write them, there is no charge. If I interview you and write them, it adds ${price(COPY_MODES, "written")}. Be honest with yourself here: waiting for the words is what stalls most website projects.`,
          `The domain. If you own it and can get into its settings, nothing. If someone else controls it, ${price(DOMAIN_STATES, "own-no-access")} for me to chase them. If you need a new one, ${price(DOMAIN_STATES, "need-domain")} and it is registered in your name.`,
        ],
      },
      { type: "h2", text: "Four real examples, priced" },
      {
        type: "p",
        text: "These are worked out by the same calculator the estimator uses, so they are exactly what you would see if you picked the same answers.",
      },
      { type: "example", title: "A trade business with a logo", who: "A plumber or electrician who has a logo, owns the domain and would rather not write the words.", answers: EX_TRADE },
      { type: "example", title: "Starting from nothing", who: "A new business with no logo, no domain and no words yet.", answers: EX_FROM_NOTHING },
      { type: "example", title: "A small catalogue", who: "A maker selling about 20 products, who writes their own descriptions.", answers: EX_CATALOGUE },
      { type: "example", title: "Bookings that reach the accounts", who: "A practice with 6 to 12 pages, online booking and invoices that go straight into Xero.", answers: EX_BOOKING },
      { type: "h2", text: "What a cheap quote usually leaves out" },
      {
        type: "p",
        text: "When a quote looks far below everyone else's, check what it does not include. The usual gaps are the words (you are expected to write them), the domain (registered in the designer's name, not yours), a monthly fee to keep the site running, and a platform you cannot take with you if you leave. None of these show up on the first invoice. All of them show up later.",
      },
      {
        type: "p",
        text: `With me, the domain, the site and every login are yours. Hosting for the first year is included. An optional care plan is ${m(CARE_PLAN.monthly)} a month, it is never part of the build price, and the site keeps working if you cancel it.`,
      },
      { type: "h2", text: "Why one person costs less than an agency" },
      {
        type: "p",
        text: "An agency quote pays for an account manager, a project manager, a designer, a developer, a tester and an office. With me you pay for the person who actually builds the site. I use AI to speed up the repetitive parts of the work, the way a carpenter uses power tools, but every design decision, every line that ships and every phone call afterwards is mine. That is where the saving comes from, not from cutting corners.",
      },
    ],
    faq: [
      {
        q: "Are these prices including VAT?",
        a: "No. Every price on the site is in rands and excludes VAT.",
      },
      {
        q: "Is there a monthly fee?",
        a: `Only if you want one. The care plan is ${m(CARE_PLAN.monthly)} a month for hosting, updates, backups and small tweaks. The site works without it and you keep everything if you cancel.`,
      },
      {
        q: "How do I get a price for my business?",
        a: "Use the estimator. Nine questions, about two minutes, and the number updates as you answer. A PDF breakdown is emailed to you straight away, with no call needed first.",
      },
      {
        q: "Will the final price match the estimate?",
        a: `After a 30-minute call I give you a fixed quote, and it lands within ${BAND} of the estimate. If the work turns out bigger than I judged, that is mine to absorb.`,
      },
    ],
    related: ["what-does-a-small-business-website-include", "how-long-does-it-take-to-build-a-website"],
  },

  {
    slug: "what-does-a-small-business-website-include",
    title: `What do you get in a ${m(FROM_PRICE)} website?`,
    metaTitle: `What a ${m(FROM_PRICE)} Small Business Website Includes`,
    description: `Exactly what is in a ${m(FROM_PRICE)} small business website: the pages, the speed, Google setup, forms and ownership, and what costs extra. No upsell list.`,
    published: "2026-10-14",
    updated: "2026-10-14",
    answer: `For ${m(FROM_PRICE)} you get a 4 to 5 page website designed for phones first, fast enough to pass Google's speed checks, set up and submitted to Google, with contact forms that save every enquiry, and with the domain, the code and every login in your name. What costs extra is selling online, connecting to other systems, designing a brand from scratch and writing the words for you.`,
    body: [
      { type: "h2", text: "The pages" },
      {
        type: "p",
        text: "Four to five separate pages, each with its own web address. Usually that means home, about, services, contact and one more, such as a gallery, a price list or an area you cover. A page here means a real destination Google can list on its own, not a section you scroll past on one long page.",
      },
      { type: "h2", text: "Included on every site, at every size" },
      {
        type: "ul",
        items: [
          "Designed for phones first. Most of your visitors are on a phone on patchy signal, so that is the version I design first.",
          "Fast. Pages load in about a second and pass Google's Core Web Vitals. Slow sites rank lower and people leave them.",
          "Set up for Google. Page titles, descriptions, a sitemap, structured data and Search Console, all done and submitted. Not an add-on.",
          "Forms that arrive. Every enquiry is emailed to you and stored, so a mail problem never quietly costs you a customer.",
          "Accessible. Proper contrast, keyboard navigation and labelled fields.",
          "Yours. The domain, the code, the analytics and every login are in your name. Hosting for the first year is included.",
        ],
      },
      { type: "h2", text: "Six planning documents before you pay" },
      {
        type: "p",
        text: "After our 30-minute call, and before you decide to go ahead, you get the whole plan in writing: what the site has to do, how it will be built, every route a visitor can take, how it will look, what information it keeps, and a dated build plan. Nothing gets built until you have read them and said yes.",
      },
      { type: "h2", text: "What costs extra, and how much" },
      {
        type: "ul",
        items: [
          `More pages: 6 to 12 pages is ${SIZE("standard")} in place of ${SIZE("brochure")}.`,
          `Selling online: from ${price(SELL_MODES, "simple")} for a small catalogue.`,
          `Connecting to other systems: ${m(INTEGRATION_FIRST)} for the first, ${m(INTEGRATION_ADDITIONAL)} for each after.`,
          `Brand design: ${price(BRAND_STATES, "have-logo")} around your existing logo, ${price(BRAND_STATES, "need-all")} for the lot.`,
          `Writing the words for you: ${price(COPY_MODES, "written")}.`,
          `Moving content across from an old site: ${m(MIGRATION.price)}.`,
        ],
      },
      { type: "h2", text: "How long it takes" },
      {
        type: "p",
        text: `A 4 to 5 page site usually takes ${days({ siteSize: "brochure" })} working days once I have what I need from you. You get a private preview link on day one and watch it fill in as I work.`,
      },
    ],
    faq: [
      {
        q: "Is a one-page website cheaper?",
        a: `No. A one-page site would cost the same as four to five pages, so I no longer offer one. Separate pages also give Google more to list.`,
      },
      {
        q: "Do I need to pay monthly for the site to keep working?",
        a: "No. Hosting for the first year is included and most sites here run on hosting that costs very little or nothing. The care plan is optional.",
      },
      {
        q: "Who builds it, a person or AI?",
        a: "A person: me. AI speeds up the repetitive typing. Every design decision, every line that ships and every test on a real phone is mine, and I am the one you phone afterwards.",
      },
    ],
    related: ["how-much-does-a-website-cost-in-south-africa", "co-za-or-com-domain"],
  },

  {
    slug: "how-long-does-it-take-to-build-a-website",
    title: "How long does it take to build a website?",
    metaTitle: "How Long Does It Take to Build a Small Business Website?",
    description:
      `A 4 to 5 page small business website takes about ${days({ siteSize: "brochure" })} working days. What makes it take longer, what usually holds it up, and how to get it live sooner.`,
    published: "2026-10-14",
    updated: "2026-10-14",
    answer:
      `A 4 to 5 page small business website takes me about ${days({ siteSize: "brochure" })} working days of building. A 6 to 12 page site takes about ${days({ siteSize: "standard" })}. Selling online, connecting to other systems and designing a brand from scratch each add a few days. In practice the biggest delays are rarely the build: they are waiting for the words, the photos and access to the domain.`,
    body: [
      { type: "h2", text: "Typical build times" },
      {
        type: "ul",
        items: [
          `4 to 5 pages: about ${days({ siteSize: "brochure" })} working days.`,
          `6 to 12 pages: about ${days({ siteSize: "standard" })} working days.`,
          `12 pages or more, with a client or member area: about ${days({ siteSize: "large" })} working days.`,
          `A small catalogue adds ${addsDays({ sell: "simple" })} days. A full online shop adds ${addsDays({ sell: "full" })}.`,
          `Each connection to another system adds ${addsDays({ integrations: ["xero"] })} days.`,
          `A brand designed from scratch adds ${addsDays({ brand: "need-all" })} days.`,
        ],
      },
      {
        type: "p",
        text: "These are the same ranges the estimator shows you next to the price, worked out from the same answers.",
      },
      { type: "h2", text: "What actually holds a website up" },
      {
        type: "p",
        text: "Agencies talk about six to twelve weeks, and most of that is calendar, not work: meetings, handovers between people, and waiting in a queue. With one person doing the work there are no handovers. What is left is waiting on things only you can provide.",
      },
      {
        type: "ul",
        items: [
          "The words. Writing six pages about your own business is harder than it sounds, and it is the most common reason a launch date slips. Having them written for you removes the wait.",
          "Photos. Real photos of your work, your team or your premises beat stock photos, but someone has to take them.",
          "The domain. If an old web designer or an IT company controls it, getting it pointed at the new site can take days of chasing. I do the chasing, but I cannot make them answer faster.",
          "Feedback. You get a preview link on day one. The sooner you comment, the sooner it is finished.",
        ],
      },
      { type: "h2", text: "If you need it sooner" },
      {
        type: "p",
        text: `A priority build moves you to the front of the queue and cuts the time by about a third, for an extra ${RUSH}. It is only worth it if a real date depends on it, such as an opening or a launch.`,
      },
    ],
    faq: [
      {
        q: "When does the clock start?",
        a: "Once you have read the planning documents, said yes and paid half. You see a preview link from the first day.",
      },
      {
        q: "Can I see it while it is being built?",
        a: "Yes. You get a private preview link on day one and it fills in as I work. No four-week silence followed by a big reveal.",
      },
    ],
    related: ["how-much-does-a-website-cost-in-south-africa", "what-does-a-small-business-website-include"],
  },

  {
    slug: "co-za-or-com-domain",
    title: ".co.za or .com: which domain should a South African business use?",
    metaTitle: ".co.za or .com? Choosing a Domain for a South African Business",
    description:
      "Should a South African small business use .co.za or .com? What each one tells customers and Google, when to buy both, and the one rule that matters more than either.",
    published: "2026-10-14",
    updated: "2026-10-14",
    answer:
      "If your customers are in South Africa, use .co.za. It tells people at a glance that you are local, and it tells Google the same thing, which helps you show up in South African searches. Choose .com if you sell abroad or plan to. If you can, register both and send one to the other. More important than either: the domain must be registered in your name, not your web designer's.",
    body: [
      { type: "h2", text: "What .co.za says" },
      {
        type: "p",
        text: "A .co.za address is South Africa's own. Customers read it as local, which matters for a plumber, a salon or an accountant whose customers are all within driving distance. Google treats country endings like .co.za as a signal that a site is aimed at that country, so it can help you in local results.",
      },
      { type: "h2", text: "When .com is the better choice" },
      {
        type: "ul",
        items: [
          "You sell to customers outside South Africa, or plan to.",
          "Your business is online only and location is beside the point.",
          "The .co.za version of your name is taken and the .com is not.",
        ],
      },
      {
        type: "compare",
        left: { title: ".co.za", items: ["Reads as local straight away", "A local signal to Google", "Usually cheaper to renew", "The natural choice for a business serving South Africa"] },
        right: { title: ".com", items: ["Reads as international", "No country signal", "Better if you sell abroad", "Often taken already for common names"] },
      },
      { type: "h2", text: "Should you buy both?" },
      {
        type: "p",
        text: "If both are available, yes. It stops someone else taking the other one, and it catches customers who type the wrong ending. Pick one as the real address and send the other to it, so Google only ever sees one version of your site.",
      },
      { type: "h2", text: "The rule that matters more than the ending" },
      {
        type: "p",
        text: "Make sure the domain is registered in your name, with your email address on it. A domain registered by a web designer or an IT company in their own name is the most common way small businesses lose control of their own website. When the relationship ends, getting it back can take weeks, and sometimes it never comes back at all.",
      },
      {
        type: "p",
        text: `If you do not have a domain yet, I check what is available, register it in your name and cover the first year, for ${price(DOMAIN_STATES, "need-domain")}. If you have one but someone else controls it, I chase them for you.`,
      },
    ],
    faq: [
      {
        q: "Does a .co.za domain help with Google?",
        a: "It helps Google understand that your site is aimed at South Africa, which can help in South African results. It will not make up for a slow site or thin content, but it points in the right direction.",
      },
      {
        q: "Can I change from .com to .co.za later?",
        a: "Yes, with redirects set up properly so you keep your Google ranking. It is easier to choose well at the start.",
      },
      {
        q: "Who should the domain be registered to?",
        a: "You, the business owner, with your own email address. Never your web designer.",
      },
    ],
    related: ["what-does-a-small-business-website-include", "do-i-need-a-website-if-i-have-a-facebook-page"],
  },

  {
    slug: "do-i-need-a-website-if-i-have-a-facebook-page",
    title: "Do I need a website if I have a Facebook page?",
    metaTitle: "Do I Need a Website If I Have a Facebook Page?",
    description:
      "An honest answer for South African small businesses: when a Facebook page and a Google profile are enough, and when a website earns its keep.",
    published: "2026-10-14",
    updated: "2026-10-14",
    answer:
      "Not always. If all your work comes from word of mouth and people only need your number, a Facebook page plus a free Google Business Profile can be enough. You need a website when people search Google for what you do and compare you with others, when you want to show prices or take bookings, or when you do not want your business to depend on a platform you do not control.",
    body: [
      { type: "h2", text: "Do this first, whatever you decide" },
      {
        type: "p",
        text: "Set up a free Google Business Profile. It is what puts you on Google Maps and in the box of local businesses at the top of a search. For most small businesses it brings in more calls than anything else, and it costs nothing. If you only do one thing after reading this, do that.",
      },
      { type: "h2", text: "When a Facebook page is enough" },
      {
        type: "ul",
        items: [
          "Almost all your work comes from referrals and repeat customers.",
          "You are fully booked and not trying to grow right now.",
          "People only need to see that you exist and find your number.",
        ],
      },
      { type: "h2", text: "When you need a website" },
      {
        type: "ul",
        items: [
          "People search Google for what you do in your area, and your competitors show up and you do not. Facebook pages rarely rank for those searches.",
          "Customers compare before they call. A website lets you show your prices, your work and why you, in your own order.",
          "You want people to book, order or pay without phoning you.",
          "You want to look established. For many customers, no website reads as not serious.",
          "You do not want to depend on Facebook. You do not own your page: an algorithm change, a hacked account or a ban can take it away overnight. A website on your own domain is yours.",
        ],
      },
      {
        type: "compare",
        left: { title: "Facebook page", items: ["Free", "Owned by Facebook, not you", "Rarely ranks in Google searches", "Your page sits next to your competitors' adverts"] },
        right: { title: "Your own website", items: ["A once-off cost", "Yours, on your own domain", "Built to be found on Google", "Only your business on the screen"] },
      },
      { type: "h2", text: "Use them together" },
      {
        type: "p",
        text: "It is not one or the other. The best setup for most small businesses is a website as home base, a Google Business Profile pointing to it, and a Facebook page for keeping in touch with people who already know you.",
      },
    ],
    faq: [
      {
        q: "Is a Google Business Profile free?",
        a: "Yes. It is free to set up and free to keep. You can list your service area without showing your home address.",
      },
      {
        q: "What is the cheapest proper website?",
        a: `With me, a 4 to 5 page site is ${m(FROM_PRICE)} excluding VAT, with the domain and every login in your name.`,
      },
    ],
    related: ["how-much-does-a-website-cost-in-south-africa", "wix-or-a-web-designer"],
  },

  {
    slug: "wix-or-a-web-designer",
    title: "Should I build my own website on Wix or pay a web designer?",
    metaTitle: "Wix or a Web Designer? An Honest Answer for Small Businesses",
    description:
      "When building your own site on Wix, Squarespace or WordPress makes sense, when paying someone is cheaper in the end, and what to check either way.",
    published: "2026-10-14",
    updated: "2026-10-14",
    answer:
      "Build it yourself if you have more time than money, enjoy fiddling, and need a simple site. Pay someone if your time is worth more spent on your business, if you want to be found on Google, or if the site has to do more than show information. Either way, check two things: who owns the domain, and what it costs every month to keep the site running.",
    body: [
      { type: "h2", text: "When doing it yourself makes sense" },
      {
        type: "ul",
        items: [
          "You are just starting out and every rand counts.",
          "You need one or two simple pages and nothing more.",
          "You genuinely enjoy this kind of thing and have the evenings for it.",
        ],
      },
      {
        type: "p",
        text: "Builders like Wix and Squarespace are good products. Plenty of businesses start on one, and that is a reasonable choice.",
      },
      { type: "h2", text: "What the builder price leaves out" },
      {
        type: "ul",
        items: [
          "Your time. Most people spend far more evenings on a DIY site than they expected, and the words still need writing.",
          "The monthly fee. Builders charge every month for as long as the site exists. Stop paying and the site goes away.",
          "Leaving. A site built on a builder generally cannot be moved elsewhere. If you outgrow it, you start again.",
          "Being found. A template does not make a site rank. Speed, structure and the words on the page do.",
        ],
      },
      {
        type: "compare",
        left: { title: "Build it yourself", items: ["Low cost to start", "Monthly fee for as long as the site exists", "Your evenings", "Usually stuck on that platform"] },
        right: { title: "Pay a person", items: ["A once-off build price", "Little or no monthly cost", "Your time back", "Yours to take anywhere"] },
      },
      { type: "h2", text: "What to check if you pay someone" },
      {
        type: "ul",
        items: [
          "The domain is registered in your name.",
          "You get every login, and the site is not held on their account with no way out.",
          "The price is fixed and in writing before you pay anything.",
          "You know who will answer when something breaks.",
        ],
      },
      {
        type: "p",
        text: `That is how I work. A 4 to 5 page site is ${m(FROM_PRICE)}, the price is fixed in writing before you pay, and the domain, the site and every login are yours.`,
      },
    ],
    faq: [
      {
        q: "Is WordPress free?",
        a: "The software is free. Hosting, a theme, plugins and someone to keep it updated and secure are not. An out-of-date WordPress site is one of the most common ways small business sites get hacked.",
      },
      {
        q: "Can you take over a site I started on Wix?",
        a: `I can rebuild it and carry your content across, so nothing is lost and your Google ranking survives the move. Moving content from an old site is ${m(MIGRATION.price)}.`,
      },
    ],
    related: ["how-much-does-a-website-cost-in-south-africa", "do-i-need-a-website-if-i-have-a-facebook-page"],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
