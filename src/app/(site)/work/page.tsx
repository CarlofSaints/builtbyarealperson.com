import type { Metadata } from "next";
import { CAPABILITY_LABELS, PROJECTS, capabilitiesInUse } from "@/lib/portfolio";
import { INTEGRATION_FIRST, formatMoney } from "@/lib/rate-card";
import { Section, H2, Lead, Eyebrow, Button, Card } from "@/components/ui";
import { SITE } from "@/lib/site";
import { Lightbox } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "What a site can do",
  description:
    "Most websites are a brochure, and that is usually the right answer. Some need to book, print, log people in or talk to something else. Here is what that looks like, built and running.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <Section className="u-glow pt-16 sm:pt-24">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Eyebrow>Proof</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl">
            What a site can do once it stops being a brochure
          </h1>
          <Lead className="mt-6">
            Most small business websites are a brochure, and that is usually the right answer. A
            few need to do something: take a booking, print a label, let staff in, talk to the
            system you already use. Below is that kind of work, built and running, so you can see
            what it means before you pay for it.
          </Lead>
          <p className="mt-5 leading-relaxed text-muted">
            All of it is in daily use by people who depend on it. Which is the fair thing to want
            to know before you hand your website to one person: that you are not the first.
          </p>
        </div>
      </Section>

      {/* What is on show, so somebody can scan for the thing they came for. */}
      <Section className="border-y border-line bg-ink-2 py-12 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-2">On this page</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {capabilitiesInUse().map((c) => (
              <span
                key={c}
                className="rounded-full border border-line-2 bg-surface px-3.5 py-1.5 text-sm text-muted"
              >
                {CAPABILITY_LABELS[c]}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl space-y-6">
          {PROJECTS.map((project) => (
            <Card key={project.slug} lift={false} className="u-reveal">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-display text-sm font-semibold uppercase tracking-wider text-turq">
                  {project.client}
                </p>
                {project.live && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-turq" aria-hidden="true" />
                    In use today
                  </span>
                )}
              </div>

              <h2 className="mt-2 font-display text-2xl font-bold leading-snug tracking-tight text-text sm:text-[1.7rem]">
                {project.headline}
              </h2>

              {/* The problem before the software. People buy the problem. */}
              <p className="mt-4 max-w-3xl leading-relaxed text-muted">{project.problem}</p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {project.does.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-muted">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-turq"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {project.capabilities.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-line-2 bg-ink px-2 py-1 text-[12px] text-muted-2"
                  >
                    {CAPABILITY_LABELS[c]}
                  </span>
                ))}
              </div>

              {project.shots && (
                <Lightbox shots={project.shots} label={`${project.client}: ${project.headline}`} />
              )}

              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-turq/50 px-4 py-2.5 font-display text-sm font-semibold text-turq transition-colors hover:bg-turq/10"
                >
                  Go and have a look
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6 3h7v7M13 3L4 12"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="sr-only">(opens {project.client} in a new tab)</span>
                </a>
              )}

              <p className="mt-6 border-t border-line pt-5 text-[15px] leading-relaxed text-text">
                <span className="font-semibold text-turq">On your quote:</span> {project.costsHere}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-2xl text-center">
          <H2>Most sites need none of this</H2>
          <Lead className="mt-5">
            If all you need is five good pages that load fast and get found, that is{" "}
            {formatMoney(9500)} and nothing above applies to you. The extras are priced separately
            precisely so you are not quietly paying for machinery you will never switch on. The
            first integration is {formatMoney(INTEGRATION_FIRST)}, and the estimator will tell you
            before you speak to me.
          </Lead>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/estimate">Build my estimate</Button>
            <Button href="/pricing" variant="ghost">
              See the rate card
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-2">
            Or just email me: {SITE.email}
          </p>
        </div>
      </Section>
    </>
  );
}
