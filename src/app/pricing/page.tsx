import type { Metadata } from "next";
import { Button, Card, Check, Eyebrow, H2, Lead, Section } from "@/components/ui";
import {
  ACCURACY_BAND,
  BRAND_STATES,
  CARE_PLAN,
  COPY_MODES,
  DOMAIN_STATES,
  HOSTING_NOTE,
  INTEGRATION_ADDITIONAL,
  INTEGRATION_FIRST,
  INTEGRATIONS,
  MARKETS,
  MIGRATION,
  MULTILINGUAL,
  RUSH_SURCHARGE,
  SELL_MODES,
  SITE_SIZES,
  formatMoney,
  type Choice,
} from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "The rate card",
  description:
    "Every price, published. Base builds from R5,500, plus what each addition costs. Work out your own number before you speak to me.",
  alternates: { canonical: "/pricing" },
};

function PriceRow({ item }: { item: Choice<string> }) {
  return (
    <li className="flex flex-col gap-1 border-b border-line py-5 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 sm:flex-1">
        <p className="font-display text-[16px] font-semibold text-text">{item.label}</p>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{item.blurb}</p>
      </div>
      <p
        className={`shrink-0 font-display text-lg font-bold tabular-nums ${
          item.price === 0 ? "text-muted-2" : "text-turq"
        }`}
      >
        {item.price === 0 ? "No charge" : formatMoney(item.price)}
      </p>
    </li>
  );
}

function Block({
  n,
  title,
  intro,
  children,
}: {
  n: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="u-reveal">
      <Card lift={false}>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xs font-bold tracking-[0.16em] text-turq">{n}</span>
          <h3 className="font-display text-2xl font-bold tracking-tight text-text">{title}</h3>
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>
        <ul className="mt-6">{children}</ul>
      </Card>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <section className="u-glow relative overflow-hidden px-5 pb-4 pt-14 sm:px-8 sm:pt-20">
        <div className="u-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <Eyebrow>The rate card</Eyebrow>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Every price,
              <br />
              <span className="u-grad-text">on the website.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg">
              Hiding prices until you have handed over your phone number wastes your time
              and mine. Here is the whole thing. Add up the rows that apply to you and you
              have your number — or let the estimator do the arithmetic.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/estimate">Let the estimator do it</Button>
            </div>
            <p className="mt-6 text-sm text-muted-2">
              All amounts in rands, excluding VAT. Prices apply to work quoted in{" "}
              {new Date().getFullYear()}.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-5">
          <Block
            n="01"
            title="The build"
            intro="Pick one. This is the foundation and everything else is added to it. A page means a separate destination with its own web address, not a section you scroll past."
          >
            {SITE_SIZES.map((s) => (
              <PriceRow key={s.id} item={s} />
            ))}
          </Block>

          <Block
            n="02"
            title="Selling online"
            intro="The single biggest thing that moves a price. Taking money brings in security, tax, stock and delivery, none of which a brochure site has to think about."
          >
            {SELL_MODES.map((s) => (
              <PriceRow key={s.id} item={s} />
            ))}
          </Block>

          <Block
            n="03"
            title="Connecting to other systems"
            intro={`The first connection costs ${formatMoney(
              INTEGRATION_FIRST,
            )} because it carries the authentication and error handling. Every connection after that is ${formatMoney(
              INTEGRATION_ADDITIONAL,
            )}, because that groundwork is already done.`}
          >
            <li className="py-2">
              <div className="flex flex-wrap gap-2">
                {INTEGRATIONS.map((i) => (
                  <span
                    key={i.id}
                    className="rounded-full border border-line bg-ink/50 px-3.5 py-1.5 text-[13.5px] text-muted"
                  >
                    {i.label}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-[14.5px] leading-relaxed text-muted-2">
                Not listed? Ask. If it has a documented way in, it can almost always be
                connected at one of these two prices.
              </p>
            </li>
          </Block>

          <Block
            n="04"
            title="Design and brand"
            intro="What you already have decides this one. If a designer has given you brand guidelines, I follow them and it costs nothing extra."
          >
            {BRAND_STATES.map((b) => (
              <PriceRow key={b.id} item={b} />
            ))}
          </Block>

          <Block
            n="05"
            title="The words"
            intro="Writing is what stalls most website projects, not design. Be honest with yourself about whether you will sit down and write six pages."
          >
            {COPY_MODES.map((c) => (
              <PriceRow key={c.id} item={c} />
            ))}
            <PriceRow item={MULTILINGUAL as Choice<string>} />
          </Block>

          <Block
            n="06"
            title="Domain and moving in"
            intro="Boring, unavoidable, and the usual reason a launch date slips. Priced separately so you can see exactly what the delay costs."
          >
            {DOMAIN_STATES.map((d) => (
              <PriceRow key={d.id} item={d} />
            ))}
            <PriceRow item={MIGRATION as Choice<string>} />
          </Block>

          <Block
            n="07"
            title="Reach"
            intro="Staying inside South Africa keeps everything simple. Crossing the border brings currencies, delivery zones, foreign tax and time zones."
          >
            {MARKETS.map((m) => (
              <PriceRow key={m.id} item={m} />
            ))}
          </Block>
        </div>
      </Section>

      {/* Ongoing + rush */}
      <Section className="border-y border-line bg-ink-2">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="u-reveal">
            <Card lift={false} className="h-full">
              <h3 className="font-display text-2xl font-bold tracking-tight text-text">
                Afterwards
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{HOSTING_NOTE}</p>

              <div className="mt-6 rounded-2xl border border-line bg-ink/50 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-[16px] font-semibold text-text">{CARE_PLAN.label}</p>
                  <p className="font-display text-lg font-bold tabular-nums text-turq">
                    {formatMoney(CARE_PLAN.monthly)}
                    <span className="text-sm font-medium text-muted-2">/month</span>
                  </p>
                </div>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{CARE_PLAN.blurb}</p>
              </div>

              <ul className="mt-6 space-y-3 text-[14.5px] text-muted">
                {[
                  "Never bundled into the build price",
                  "Cancel whenever — the site keeps working",
                  "You keep the domain, the code and every login either way",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="u-reveal" data-reveal-delay="100">
            <Card lift={false} className="h-full">
              <h3 className="font-display text-2xl font-bold tracking-tight text-text">
                Two things that change the total
              </h3>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-[16px] font-semibold text-text">
                      Priority build
                    </p>
                    <p className="font-display text-lg font-bold text-pink">
                      +{Math.round(RUSH_SURCHARGE * 100)}%
                    </p>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    You go to the front of the queue and other work moves aside. Only
                    worth it if a real date depends on it.
                  </p>
                </div>

                <div className="border-t border-line pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-[16px] font-semibold text-text">
                      The accuracy promise
                    </p>
                    <p className="font-display text-lg font-bold text-turq">
                      ±{Math.round(ACCURACY_BAND * 100)}%
                    </p>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                    Your estimate is not a quote. But after our 45-minute call I give you a
                    fixed quote, and it will land inside that band. If the work turns out
                    bigger than I judged, that is mine to absorb.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-turq/20 bg-turq/[0.05] p-5">
                <p className="text-[14.5px] leading-relaxed text-text">
                  Payment is half to start and half on the day it goes live. No deposit is
                  taken before you have seen a fixed quote in writing.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <div className="u-reveal mx-auto max-w-2xl text-center">
          <H2>Add it up yourself, or let me do it</H2>
          <Lead className="mx-auto">
            The estimator uses exactly these numbers — nothing hidden, nothing added at
            the end. Two minutes and the PDF is in your inbox.
          </Lead>
          <div className="mt-9 flex justify-center">
            <Button href="/estimate">Build my estimate</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
