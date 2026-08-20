import Link from "next/link";
import { Button, Card, Check, Cross, Eyebrow, H2, Lead, Section } from "@/components/ui";
import { FROM_PRICE, formatMoney } from "@/lib/rate-card";
import { SITE } from "@/lib/site";

const TRUST = [
  "Live in days, not months",
  "Fixed price agreed up front",
  "No monthly lock-in",
  "You own the code and the content",
  "Built for phones first",
  "One person, one phone number",
  "Loads in under a second",
  "POPIA-friendly forms",
];

const STEPS = [
  {
    n: "01",
    title: "Price it yourself, in two minutes",
    body:
      "Answer nine questions about what you need. The total updates as you go — no waiting for a call back, no being asked for your budget first. A PDF lands in your inbox straight away.",
    note: "Immediate",
  },
  {
    n: "02",
    title: "We talk for 45 minutes",
    body:
      "A Teams call. I ask what your business actually does, who buys from you and what has to happen on the site for it to have been worth it. You get a fixed quote after this — no more estimating.",
    note: "Within a day or two",
  },
  {
    n: "03",
    title: "I build it, and you watch",
    body:
      "You get a private preview link on day one and it fills in as I work. You comment, I fix. No four-week silence followed by a big reveal you have to pretend to like.",
    note: "Most sites: 5–10 working days",
  },
  {
    n: "04",
    title: "It goes live and it is yours",
    body:
      "I point the domain, check it on real phones, submit it to Google and hand over every login. Walk away whenever you like — nothing is held hostage.",
    note: "Yours, permanently",
  },
];

const INCLUDED = [
  { title: "Fast, properly", body: "Sub-second loads and green Core Web Vitals. Google ranks slow sites lower and people leave them faster." },
  { title: "Phone first", body: "Most of your visitors are on a phone on bad signal. That is the version I design first, not the one I squash down at the end." },
  { title: "Found on Google", body: "Titles, descriptions, sitemap, structured data and Search Console set up and submitted. Not an add-on." },
  { title: "Forms that arrive", body: "Enquiries land in your inbox and are stored, so a mail glitch never quietly costs you a customer." },
  { title: "Accessible", body: "Real contrast, keyboard navigation, labelled fields. It is the law's direction of travel and it is just better." },
  { title: "Handed over clean", body: "Every login, the code, the domain, the analytics. In your name, from day one." },
];

const FAQ = [
  {
    q: "So is my website written by AI or not?",
    a: "The code is written faster because I use AI, in the same way an accountant uses a spreadsheet instead of a ledger book. But nothing reaches you that I have not designed, read, tested and taken responsibility for. AI cannot sit on a call and work out that your real problem is that nobody can find your prices. That part is me.",
  },
  {
    q: "Why are you so much cheaper than an agency?",
    a: "An agency quote pays for an account manager, a project manager, a designer, a developer, a tester and an office. You are paying for one of those things — the person who actually builds it. AI closes the gap in throughput, and I have no office in Sandton to fund.",
  },
  {
    q: "How can you promise the final quote is within 20% of the estimate?",
    a: "Because the estimator asks the questions that actually move the price: how many pages, whether you sell, what has to connect to what, and who owns the domain. After the 45-minute call I give you a fixed quote. If the work turns out bigger than that, the difference is mine to absorb, not yours to pay.",
  },
  {
    q: "What if I do not know what I want yet?",
    a: "Most people do not, and that is fine. Pick your best guess in the estimator — the number moves as you change your mind, and nothing you choose is binding. The call is where it gets sorted out.",
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

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="u-glow relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="u-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="u-reveal">
              <Eyebrow>Websites for South African small businesses</Eyebrow>
            </div>

            <h1 className="u-reveal font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl" data-reveal-delay="60">
              A real person builds
              <br />
              your website.
              <br />
              <span className="u-grad-text">AI just makes me fast.</span>
            </h1>

            <p className="u-reveal mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl" data-reveal-delay="140">
              I use AI the way a carpenter uses power tools — it speeds up the work,
              it does not do the work. Every site is designed, built, tested and
              signed off by me, and I am the one who answers the phone afterwards.
            </p>

            <div className="u-reveal mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal-delay="220">
              <Button href="/estimate">Build my estimate — 2 minutes</Button>
              <Button href="/pricing" variant="ghost">
                See the rate card
              </Button>
            </div>

            <p className="u-reveal mt-6 text-sm text-muted-2" data-reveal-delay="280">
              From <span className="font-semibold text-turq">{formatMoney(FROM_PRICE)}</span>. No
              call needed to see a price. No &ldquo;what&rsquo;s your budget?&rdquo; before I tell you mine.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust marquee ───────────────────────────────────────────────── */}
      <div className="u-marquee-mask relative overflow-hidden border-y border-line bg-ink-2 py-3.5">
        <div className="u-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8" aria-hidden={copy === 1}>
              {TRUST.map((t) => (
                <span key={t} className="flex items-center gap-3 text-sm text-muted">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink/80" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── The honest bit ──────────────────────────────────────────────── */}
      <Section id="honest">
        <div className="u-reveal max-w-3xl">
          <Eyebrow>The AI question, answered properly</Eyebrow>
          <H2>
            Where the machine stops
            <br className="hidden sm:block" /> and <span className="u-grad-text">I start</span>
          </H2>
          <Lead>
            You have probably been offered an &ldquo;AI-generated website&rdquo; before. They all look
            the same, half the buttons go nowhere, and there is nobody to phone when it
            falls over. That is not because AI is useless. It is because nobody was
            driving. I am driving.
          </Lead>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <div className="u-reveal">
            <Card className="h-full">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-2">
                What the AI does
              </h3>
              <p className="mt-2 text-sm text-muted-2">The boring, repetitive, fast parts.</p>
              <ul className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
                {[
                  "Types out the repetitive code so I do not have to",
                  "Throws up rough layout options for me to react to and mostly reject",
                  "Drafts first-pass wording that I then rewrite in your voice",
                  "Handles the tedium: image sizing, alt text, boilerplate, browser quirks",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check tone="pink" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 rounded-xl border border-line bg-ink/50 p-4 text-sm leading-relaxed text-muted-2">
                Net effect: roughly three weeks of work compressed into about one. That
                saving is why the price is what it is.
              </p>
            </Card>
          </div>

          <div className="u-reveal" data-reveal-delay="100">
            <Card className="h-full border-turq/25">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-turq">
                What I do
              </h3>
              <p className="mt-2 text-sm text-muted-2">Everything that decides whether it works.</p>
              <ul className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
                {[
                  "Sit with you and work out what the site is actually for",
                  "Make every design decision — layout, colour, hierarchy, what to cut",
                  "Read every line of code that ships, because AI gets things confidently wrong",
                  "Test it on real phones, on real signal, the way your customers will use it",
                  "Answer the phone in six months when something needs changing",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 rounded-xl border border-turq/20 bg-turq/5 p-4 text-sm leading-relaxed text-text">
                If your site is wrong, that is my fault and my problem — not a model&rsquo;s.
                That accountability is the whole product.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <Section id="how" className="border-y border-line bg-ink-2">
        <div className="u-reveal max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <H2>Four steps. No mystery.</H2>
          <Lead>
            The whole process, start to finish. You will know the price before we
            have even spoken.
          </Lead>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.n} className="u-reveal" data-reveal-delay={i * 80}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-4xl font-extrabold leading-none text-line-2">
                    {step.n}
                  </span>
                  <span className="rounded-full border border-line bg-ink/60 px-3 py-1 text-[11px] font-medium text-turq">
                    {step.note}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-text">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <div className="u-reveal mt-10">
          <Button href="/estimate">Start with step one</Button>
        </div>
      </Section>

      {/* ── Why cheaper ─────────────────────────────────────────────────── */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="u-reveal">
            <Eyebrow>The obvious question</Eyebrow>
            <H2>
              &ldquo;Why is this
              <br className="hidden sm:block" /> so much cheaper?&rdquo;
            </H2>
            <Lead>
              Because you are not paying for the parts of an agency that never touch
              your website. Here is where a typical R60,000 quote actually goes.
            </Lead>
            <p className="mt-6 text-[15px] leading-relaxed text-muted">
              Cheaper does not mean worse here — it means fewer people taking a cut and
              a shorter calendar. The site you get is the same standard I would ship to
              a client paying five times more, because it is the only standard I know
              how to work to.
            </p>
          </div>

          <div className="u-reveal" data-reveal-delay="120">
            <Card lift={false}>
              <ul className="space-y-3.5 text-[15px]">
                {[
                  ["Account manager", false],
                  ["Project manager", false],
                  ["Designer who never meets you", false],
                  ["Developer", true],
                  ["Separate QA tester", false],
                  ["Office in Sandton", false],
                  ["Agency margin", false],
                ].map(([label, kept]) => (
                  <li
                    key={label as string}
                    className={`flex items-center gap-3 ${kept ? "text-text" : "text-muted-2 line-through decoration-line-2"}`}
                  >
                    {kept ? <Check /> : <Cross />}
                    <span className={kept ? "font-semibold" : ""}>{label as string}</span>
                    {kept ? (
                      <span className="ml-auto rounded-full bg-turq/10 px-2.5 py-0.5 text-[11px] font-semibold text-turq">
                        that&rsquo;s me
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-muted">
                One person, using the fastest tools available, with no overhead to
                recover. That is the entire trick.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── What's included ─────────────────────────────────────────────── */}
      <Section className="border-y border-line bg-ink-2">
        <div className="u-reveal max-w-3xl">
          <Eyebrow>Included as standard</Eyebrow>
          <H2>Not an upsell list</H2>
          <Lead>
            Every one of these is in the base price, on every site, at every size.
            Other people charge extra for most of them.
          </Lead>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((item, i) => (
            <div key={item.title} className="u-reveal" data-reveal-delay={(i % 3) * 70}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <Check />
                  <h3 className="font-display text-[17px] font-bold text-text">{item.title}</h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.body}</p>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Pricing teaser ──────────────────────────────────────────────── */}
      <Section>
        <div className="u-reveal u-card relative overflow-hidden p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #2ae8ce 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <H2>Published, not negotiated</H2>
              <Lead>
                The full rate card is on the website, because hiding prices wastes
                everybody&rsquo;s time. Work out your own number before you speak to me
                — the estimator uses exactly the same figures.
              </Lead>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/estimate">Build my estimate</Button>
                <Button href="/pricing" variant="ghost">
                  Read the rate card
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-ink/60 p-7">
              <p className="text-sm text-muted-2">A small business site starts at</p>
              <p className="mt-2 font-display text-5xl font-extrabold tracking-tight text-text">
                {formatMoney(FROM_PRICE)}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                One page, live in under a week. Four to five pages is{" "}
                <span className="font-semibold text-text">{formatMoney(9500)}</span>. Everything
                else is an addition you can see and price yourself.
              </p>
              <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted-2">
                Estimates land within 20% of the final quote. After our call the quote
                is fixed and the risk is mine.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <Section className="border-t border-line bg-ink-2">
        <div className="u-reveal max-w-3xl">
          <Eyebrow>Fair questions</Eyebrow>
          <H2>Things people ask before they trust me</H2>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {FAQ.map((item, i) => (
            <details
              key={item.q}
              className="u-reveal group u-card u-card-lift overflow-hidden p-0"
              data-reveal-delay={(i % 2) * 70}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-6 font-display text-[17px] font-semibold text-text marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  className="mt-1 shrink-0 text-turq transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="u-glow relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="u-reveal font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Find out what it costs
            <br />
            <span className="u-grad-text">before you talk to anyone.</span>
          </h2>
          <p className="u-reveal mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted" data-reveal-delay="80">
            Nine questions. Two minutes. A PDF estimate in your inbox immediately, and
            a real conversation only if you want one.
          </p>
          <div className="u-reveal mt-10 flex justify-center" data-reveal-delay="160">
            <Button href="/estimate">Build my estimate</Button>
          </div>
          <p className="u-reveal mt-6 text-sm text-muted-2" data-reveal-delay="200">
            Would rather just write to me?{" "}
            <a href={`mailto:${SITE.email}`} className="text-turq underline-offset-4 hover:underline">
              {SITE.email}
            </a>
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: SITE.name,
            description: SITE.description,
            url: SITE.url,
            email: SITE.email,
            areaServed: "ZA",
            priceRange: `From ${formatMoney(FROM_PRICE)}`,
            serviceType: "Website design and development",
          }),
        }}
      />
    </>
  );
}
