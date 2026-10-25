import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FROM_PRICE, formatMoney } from "@/lib/rate-card";
import { SITE } from "@/lib/site";
import { JsonLd, homeSchema } from "@/lib/schema";
import { Blueprint } from "@/components/home/Blueprint";
import { PricePicker } from "@/components/home/PricePicker";
import { FaqIndex } from "@/components/home/FaqIndex";
import type { Metadata } from "next";

/**
 * The homepage title on its own: with the brand added it ran to 86 characters
 * and Google cut it off. The brand still reaches the result as the site name.
 * Set here rather than as the layout default, so other pages keep the brand.
 */
export const metadata: Metadata = { title: { absolute: SITE.searchTitle } };

/** Three real screens for the hero stack, back to front. */
const HERO_SHOTS = [
  { src: "/work/iram-routes/map.jpg", alt: "A route planner showing 2,250 stores across South Africa on one map" },
  { src: "/work/cubana-register/properties.jpg", alt: "A property register with each property's value, bond and equity" },
  { src: "/work/colab-hub/billing.jpg", alt: "A billing dashboard splitting a month's costs across four businesses" },
];

/**
 * The work that passes under the pinned heading. Anonymised captures of real
 * systems; only clients who gave permission (see src/lib/portfolio.ts).
 */
const WORK = [
  { src: "/work/colab-hub/xero.jpg", w: 1488, h: 812, who: "COLAB", caption: "Billing that goes straight into Xero, so a figure is never typed twice." },
  { src: "/work/iram-routes/map.jpg", w: 1528, h: 784, who: "iRam Route Planner", caption: "Every store a sales team covers, on one map instead of a spreadsheet." },
  { src: "/work/cubana-register/dashboard.jpg", w: 1488, h: 812, who: "Cubana Properties", caption: "What needs attention today: renewals, expiring leases, anything overdue." },
  { src: "/work/iram-flow/process.jpg", w: 1528, h: 784, who: "iRam Flow", caption: "A warehouse job from spreadsheet to signed delivery note, filed by itself." },
  { src: "/work/colab-hub/room-bookings.jpg", w: 1528, h: 784, who: "COLAB", caption: "Meeting rooms for the week. Click an empty slot and it is yours." },
];

const AI_SPLIT: [string, "ai" | "me"][] = [
  ["Sit with you and work out what the site is actually for", "me"],
  ["Type out the repetitive code", "ai"],
  ["Make every design decision: layout, colour, what to cut", "me"],
  ["Throw up rough layouts for me to react to, and mostly reject", "ai"],
  ["Read every line that ships, because AI gets things confidently wrong", "me"],
  ["Draft first-pass wording that I rewrite in your voice", "ai"],
  ["Test it on real phones, on real signal", "me"],
  ["Handle the tedium: image sizes, alt text, browser quirks", "ai"],
  ["Answer the phone in six months when something needs changing", "me"],
];

const STEPS = [
  {
    verb: "Price.",
    title: "Price it yourself, in two minutes",
    body: "Nine questions. The total updates as you go and a PDF lands in your inbox. Nobody asks for your budget first.",
    note: "Immediate",
    tone: "bg-turq text-ink",
    soft: "text-ink/75",
  },
  {
    verb: "Talk.",
    title: "We talk for 30 minutes",
    body: "A Teams call about what your business does and who buys from you. You get a fixed quote and the full plan in writing.",
    note: "Within a day or two",
    tone: "bg-ink-2 text-text",
    soft: "text-muted",
  },
  {
    verb: "Build.",
    title: "I build it, and you watch",
    body: "A private preview link on day one that fills in as I work. You comment, I fix. No four-week silence and a big reveal.",
    note: "Most sites: 5 to 10 working days",
    tone: "bg-pink text-ink",
    soft: "text-ink/75",
  },
  {
    verb: "Launch.",
    title: "It goes live and it is yours",
    body: "I point the domain, check it on real phones, submit it to Google and hand over every login. Nothing is held hostage.",
    note: "Yours, permanently",
    tone: "bg-surface text-text",
    soft: "text-muted",
  },
];

/** The planning pack a client reads before deciding to go ahead. */
const PLAN_DOCS = [
  {
    title: "Product Requirements",
    body: "What the site has to do, in plain English. Who it is for, every page, every feature, and what success looks like. If it is not in here, it is not in the price.",
  },
  {
    title: "Technical Requirements",
    body: "How it will be built. Where it is hosted, the tools underneath, the speed and security it has to meet. Another developer could pick it up and follow it.",
  },
  {
    title: "App Flow",
    body: "Every route a visitor can take, drawn step by step, from finding you on Google to sending an enquiry, making a booking or paying.",
  },
  {
    title: "Design Brief",
    body: "How it will look and feel. Colours, fonts, the tone of the words and examples of the style, agreed before a single page is designed.",
  },
  {
    title: "Backend Schema",
    body: "What information the site keeps and who may see it. Enquiries, bookings, products or customers, mapped out before any of it exists.",
  },
  {
    title: "Implementation Plan",
    body: "The build in steps, with dates. What I do first, what I need from you and by when, and when each piece appears on your preview.",
  },
];

const AGENCY: [string, boolean][] = [
  ["Account manager", false],
  ["Project manager", false],
  ["Designer who never meets you", false],
  ["Developer", true],
  ["Separate QA tester", false],
  ["Office in Sandton", false],
  ["Agency margin", false],
];

const INCLUDED = [
  { title: "Fast, properly", body: "Sub-second loads and green Core Web Vitals. Google ranks slow sites lower and people leave them faster." },
  { title: "Phone first", body: "Most of your visitors are on a phone on bad signal. That is the version I design first." },
  { title: "Found on Google", body: "Titles, descriptions, sitemap, structured data and Search Console, set up and submitted." },
  { title: "Forms that arrive", body: "Enquiries land in your inbox and are stored, so a mail glitch never quietly costs you a customer." },
  { title: "Accessible", body: "Real contrast, keyboard navigation, labelled fields. It is the law's direction of travel and it is just better." },
  { title: "Handed over clean", body: "The domain, the code, the analytics and every login, in your name. Where it is hosted is decided together, in writing." },
];

const FAQ = [
  {
    q: "So is my website written by AI or not?",
    a: "The code is written faster because I use AI, in the same way an accountant uses a spreadsheet instead of a ledger book. But nothing reaches you that I have not designed, read, tested and taken responsibility for. AI cannot sit on a call and work out that your real problem is that nobody can find your prices. That part is me.",
  },
  {
    q: "Why are you so much cheaper than an agency?",
    a: "An agency quote pays for an account manager, a project manager, a designer, a developer, a tester and an office. You are paying for one of those things: the person who actually builds it. AI closes the gap in throughput, and I have no office in Sandton to fund.",
  },
  {
    q: "How can you promise the final quote is within 20% of the estimate?",
    a: "Because the estimator asks the questions that actually move the price: how many pages, whether you sell, what has to connect to what, and who owns the domain. After the 30-minute call I give you a fixed quote. If the work turns out bigger than that, the difference is mine to absorb, not yours to pay.",
  },
  {
    q: "What if I do not know what I want yet?",
    a: "Most people do not, and that is fine. Pick your best guess in the estimator. The number moves as you change your mind, and nothing you choose is binding. The call is where it gets sorted out.",
  },
  {
    q: "Who owns it when it is finished?",
    a: "You do. The domain is registered in your name, the code is yours, the accounts are yours. There is no version of this where leaving me costs you your website.",
  },
  {
    q: "Do I have to pay you monthly?",
    a: "No. There is an optional care plan if you want me keeping an eye on it, but the site works fine without it and you can cancel it any time without losing anything.",
  },
  {
    q: "What if something breaks at 7pm on a Friday?",
    a: "You message me and I fix it. That is the entire escalation process. It is one of the genuine advantages of hiring a person rather than a queue.",
  },
];

/** Stagger for the parts of one section, in ms. */
const d = (n: number) => ({ "data-reveal-delay": n * 80 });

export default function Home() {
  return (
    <>
      {/* ── Hero: the blueprint under the cursor, the real work tilting toward it ── */}
      <section data-pointer className="relative isolate overflow-hidden px-4 sm:px-8">
        <Blueprint />
        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-10">
          <div>
            <h1 className="u-reveal font-display text-[clamp(3rem,12vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.045em] lg:text-[clamp(4rem,6.2vw,7rem)]">
              Built by a <span className="whitespace-nowrap">real person.</span>
            </h1>
            <p className="u-reveal mt-8 max-w-[22ch] font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-turq" {...d(1)}>
              A real person builds your website. AI just makes me fast.
            </p>
            <p className="u-reveal mt-6 max-w-[48ch] text-lg leading-relaxed text-text" {...d(2)}>
              A 4 to 5 page site from {formatMoney(FROM_PRICE)}, live in about a week. The
              whole rate card is published, so you know the price before we ever speak.
            </p>
            <div className="u-reveal mt-10 flex flex-col gap-4 sm:flex-row sm:items-center" {...d(3)}>
              <Link
                href="/estimate"
                data-magnetic
                className="inline-flex items-center justify-center rounded-full bg-turq px-7 py-4 font-display text-base font-bold text-ink transition-[background-color,scale] duration-200 hover:bg-white active:scale-95"
              >
                Build my estimate in 2 minutes
              </Link>
              <Link href="/pricing" className="px-2 py-3 text-base font-semibold text-text underline-offset-4 transition-colors hover:text-turq hover:underline">
                See the rate card
              </Link>
            </div>
          </div>

          <div className="u-reveal u-stack relative h-[300px] sm:h-[420px] lg:h-[560px]" {...d(2)}>
            <div className="u-stack-inner absolute inset-0">
              {HERO_SHOTS.map((s, i) => (
                <div
                  key={s.src}
                  className="u-stack-card absolute w-[86%] overflow-hidden rounded-xl bg-surface"
                  style={
                    {
                      left: `${i * 7}%`,
                      top: `${i * 16}%`,
                      "--z": `${i * 70}px`,
                      animationDelay: `${i * -2.3}s`,
                    } as CSSProperties
                  }
                >
                  <Image src={s.src} alt={s.alt} width={1528} height={784} priority={i === 2} sizes="(min-width: 1024px) 45vw, 90vw" className="block h-auto w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Real work: the heading holds still while the systems pass ─────── */}
      <section id="work" className="relative px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h2 className="u-reveal font-display text-[clamp(3.25rem,8vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
                Real work.
              </h2>
              <p className="u-reveal mt-8 max-w-[38ch] text-lg leading-relaxed text-text" {...d(1)}>
                Not mock-ups. These are systems I designed and built, that businesses run on every day. Names and
                figures are swapped out to protect the people in them.
              </p>
              <Link
                href="/work"
                className="u-reveal mt-8 inline-flex items-center gap-2 text-lg font-semibold text-turq underline-offset-4 hover:underline"
                {...d(2)}
              >
                See what each one does and costs
                <Arrow />
              </Link>
            </div>
          </div>

          <ul className="space-y-24 lg:col-span-7 lg:space-y-40">
            {WORK.map((w, i) => (
              <li key={w.src + i} className={`u-scroll-in ${i % 2 ? "lg:pl-16" : "lg:pr-16"}`}>
                <figure data-pointer className="u-tilt">
                  <div className="overflow-hidden rounded-xl bg-surface">
                    <Image src={w.src} alt={w.caption} width={w.w} height={w.h} sizes="(min-width: 1024px) 50vw, 92vw" className="block h-auto w-full" />
                  </div>
                  <figcaption className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted">
                    <span className="font-semibold text-text">{w.who}.</span> {w.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The AI question, as a ledger: who does which job ──────────────── */}
      <section id="honest" className="scroll-mt-16 bg-ink-2 px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="u-reveal font-display text-[clamp(2.125rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] lg:col-span-7">
              Where the machine stops and I start
            </h2>
            <p className="u-reveal max-w-[44ch] self-end text-lg leading-relaxed text-text lg:col-span-5" {...d(1)}>
              I use AI the way a carpenter uses power tools: it speeds up the work, it does not do the work. Roughly
              three weeks compressed into one. That saving is why the price is what it is.
            </p>
          </div>

          <table className="mt-16 w-full border-separate border-spacing-y-1 text-left lg:mt-24">
            <caption className="sr-only">Who does each job on your website: me or the AI</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">The job</th>
                <th scope="col">Who does it</th>
              </tr>
            </thead>
            <tbody>
              {AI_SPLIT.map(([job, who], i) => (
                <tr key={job} className="u-reveal group" {...d(i % 4)}>
                  <td
                    className={`py-2.5 pr-6 font-display text-[clamp(1.25rem,2.2vw,2rem)] font-semibold leading-tight tracking-[-0.015em] transition-transform duration-300 group-hover:translate-x-2 ${
                      who === "me" ? "text-text" : "text-muted"
                    }`}
                  >
                    {job}
                  </td>
                  <td
                    className={`w-24 py-2.5 text-right font-display text-[clamp(1.25rem,2.2vw,2rem)] font-extrabold ${
                      who === "me" ? "text-turq" : "text-pink/70"
                    }`}
                  >
                    {who === "me" ? "Me" : "AI"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="u-reveal mt-16 max-w-[34ch] font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-text">
            If your site is wrong, that is my fault and my problem, not a model&rsquo;s. That accountability is the whole
            product.
          </p>
        </div>
      </section>

      {/* ── How it works: one verb at a time ──────────────────────────────── */}
      <section id="how" className="scroll-mt-16">
        <h2 className="sr-only">How it works, in four steps</h2>
        {STEPS.map((s) => (
          <div key={s.verb} data-pointer className={`relative min-h-[88svh] overflow-hidden ${s.tone}`}>
            <div className="sticky top-0 flex h-[88svh] items-center justify-center px-4">
              <p className="u-verb font-display text-[clamp(4.5rem,19vw,17rem)] font-extrabold leading-none tracking-[-0.05em]" aria-hidden="true">
                {s.verb}
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-8 sm:pb-14">
              <div className="mx-auto max-w-7xl">
                <div className="u-reveal max-w-[40ch]">
                  <h3 className="font-display text-2xl font-bold tracking-[-0.01em]">{s.title}</h3>
                  <p className={`mt-3 text-[17px] leading-relaxed ${s.soft}`}>{s.body}</p>
                  <p className="mt-4 text-base font-semibold">{s.note}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── The planning pack ─────────────────────────────────────────────── */}
      <section id="plan" className="scroll-mt-16 px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="u-reveal font-display text-[clamp(2.125rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] lg:col-span-7">
              Six documents before you say yes
            </h2>
            <p className="u-reveal max-w-[44ch] self-end text-lg leading-relaxed text-text lg:col-span-5" {...d(1)}>
              After our call, and before you decide, you get the whole plan in writing. Written by me, for your
              business. You see what you are buying before you pay for any of it.
            </p>
          </div>

          <ol className="mt-16 lg:mt-24">
            {PLAN_DOCS.map((doc, i) => (
              <li key={doc.title} className="u-reveal group grid gap-3 py-6 lg:grid-cols-12 lg:gap-8 lg:py-8" {...d(i % 3)}>
                <h3 className="font-display text-[clamp(1.75rem,3.2vw,3rem)] font-extrabold leading-none tracking-[-0.03em] text-text transition-[color,translate] duration-300 group-hover:translate-x-3 group-hover:text-turq lg:col-span-6">
                  {doc.title}
                </h3>
                <p className="max-w-[52ch] text-[17px] leading-relaxed text-muted lg:col-span-5 lg:col-start-8">{doc.body}</p>
              </li>
            ))}
          </ol>

          <p className="u-reveal mt-12 max-w-[60ch] text-lg leading-relaxed text-text">
            Nothing gets built until you have read them and said yes. If something in them is wrong, we change the
            document, not the invoice. Once the build starts, they are the yardstick.
          </p>
        </div>
      </section>

      {/* ── Why cheaper: the agency, crossed out line by line ─────────────── */}
      <section className="bg-ink-2 px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="u-reveal font-display text-[clamp(2.125rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
              Why so much cheaper?
            </h2>
            <p className="u-reveal mt-8 max-w-[40ch] text-lg leading-relaxed text-text" {...d(1)}>
              Because you are not paying for the parts of an agency that never touch your website. Here is where a
              typical R60,000 agency quote goes.
            </p>
            <p className="u-reveal mt-5 max-w-[40ch] text-[17px] leading-relaxed text-muted" {...d(2)}>
              Cheaper does not mean worse. It means fewer people taking a cut and a shorter calendar. The site you get
              is the same standard I would ship to a client paying five times more.
            </p>
          </div>
          <ul className="lg:col-span-6 lg:col-start-7">
            {AGENCY.map(([label, kept], i) => (
              <li
                key={label}
                className={`u-reveal flex items-baseline gap-4 py-1.5 font-display text-[clamp(1.75rem,3.4vw,3.25rem)] font-extrabold leading-[1.1] tracking-[-0.03em] ${
                  kept ? "text-text" : "text-muted-2"
                }`}
                {...d(i)}
              >
                <span className={kept ? "" : "u-strike"}>{label}</span>
                {kept ? <span className="text-lg font-bold tracking-normal text-turq">that&rsquo;s me</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Included: not an upsell list ──────────────────────────────────── */}
      <section className="px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <h2 className="u-reveal max-w-[16ch] font-display text-[clamp(2.125rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            In every site, at every size
          </h2>
          <p className="u-reveal mt-6 max-w-[48ch] text-lg leading-relaxed text-text" {...d(1)}>
            Not an upsell list. Other people charge extra for most of these.
          </p>
          <ul className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {INCLUDED.map((item, i) => (
              <li key={item.title} className="u-reveal" {...d(i % 3)}>
                <h3 className="font-display text-2xl font-bold tracking-[-0.01em] text-text">{item.title}</h3>
                <p className="mt-3 max-w-[38ch] text-[17px] leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing: pick a size, watch the figure ────────────────────────── */}
      <section id="price" className="scroll-mt-16 bg-ink-2 px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <h2 className="u-reveal mb-14 font-display text-[clamp(2.125rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] lg:mb-20">
            Published, not negotiated
          </h2>
          <div className="u-reveal" {...d(1)}>
            <PricePicker />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-28 sm:px-8 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <h2 className="u-reveal mb-14 max-w-[18ch] font-display text-[clamp(2.125rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] lg:mb-20">
            Fair questions, straight answers
          </h2>
          <div className="u-reveal" {...d(1)}>
            <FaqIndex items={FAQ} />
          </div>
        </div>
      </section>

      {/* ── The band is the button ────────────────────────────────────────── */}
      <Link
        href="/estimate"
        className="group relative flex min-h-[46svh] flex-col justify-between overflow-hidden bg-turq px-4 pb-4 pt-8 text-ink sm:px-8 sm:pt-12 lg:min-h-[64svh] hover:bg-pink focus-visible:bg-pink"
      >
        <span className="flex items-start justify-between gap-6">
          <span className="max-w-[30ch] text-[17px] font-medium leading-snug sm:text-xl">
            Nine questions, two minutes, a PDF estimate in your inbox. A real conversation only if you want one.
          </span>
          <svg className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-12 sm:w-12" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M12 36L36 12M16 12h20v20" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
          </svg>
        </span>
        <span data-magnetic="0.06" className="block font-display text-[clamp(4rem,18.5vw,19rem)] font-extrabold leading-[0.8] tracking-[-0.055em]">
          Estimate.
        </span>
      </Link>

      {/* The FAQ above goes in as structured data so Google can read it as questions. */}
      <JsonLd data={homeSchema(FAQ)} />
    </>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
