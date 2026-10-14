import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Check } from "@/components/ui";
import { GUIDES, getGuide, priceExample, type Block } from "@/lib/guides";
import { formatMoney } from "@/lib/rate-card";
import { SITE } from "@/lib/site";
import { shareMetadata } from "@/lib/share";
import { JsonLd, guideSchema } from "@/lib/schema";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return {
    title: { absolute: g.metaTitle },
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    ...shareMetadata({ title: g.metaTitle, description: g.description, path: `/guides/${g.slug}`, type: "article" }),
  };
}

/** A worked example, priced live by the estimator's own function. */
function Example({ b }: { b: Extract<Block, { type: "example" }> }) {
  const e = priceExample(b.answers);
  return (
    <div className="u-card p-6 sm:p-7">
      <p className="font-display text-lg font-semibold text-text">{b.title}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{b.who}</p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {e.lines.map((l) => (
          <li key={l.label} className="flex items-baseline justify-between gap-6 py-3 text-[15px]">
            <span className="min-w-0 text-muted">{l.label}</span>
            <span className="shrink-0 tabular-nums text-text">{formatMoney(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between gap-6">
        <span className="font-display font-semibold text-text">Total, excluding VAT</span>
        <span className="font-display text-xl font-bold tabular-nums text-turq">{formatMoney(e.total)}</span>
      </div>
      <p className="mt-2 text-sm text-muted-2">
        About {e.daysLow} to {e.daysHigh} working days.
      </p>
    </div>
  );
}

function Body({ b }: { b: Block }) {
  switch (b.type) {
    case "h2":
      return <h2 className="pt-6 font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">{b.text}</h2>;
    case "p":
      return <p className="text-[17px] leading-relaxed text-muted">{b.text}</p>;
    case "ul":
      return (
        <ul className="space-y-3">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 text-[17px] leading-relaxed text-muted">
              <Check />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "compare":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {[b.left, b.right].map((side, i) => (
            <div
              key={side.title}
              className={`rounded-2xl border p-5 ${i === 1 ? "border-turq/30 bg-turq/[0.05]" : "border-line bg-ink-2"}`}
            >
              <p className={`font-display text-lg font-semibold ${i === 1 ? "text-turq" : "text-text"}`}>{side.title}</p>
              <ul className="mt-3 space-y-2 text-[15px] text-muted">
                {side.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case "example":
      return <Example b={b} />;
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const related = g.related.map(getGuide).filter((r) => r !== undefined);
  const updated = new Date(g.updated).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <JsonLd data={guideSchema(g)} />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-2">
          <Link href="/" className="transition-colors hover:text-turq">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/guides" className="transition-colors hover:text-turq">
            Guides
          </Link>
        </nav>
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-text sm:text-5xl">
          {g.title}
        </h1>
        <p className="mt-4 text-sm text-muted-2">
          Written by {SITE.builder.name}, the person who builds every site. Updated {updated}.
        </p>

        {/* The short answer first, for the reader in a hurry and for Google's snippet. */}
        <p className="mt-10 rounded-2xl border border-turq/25 bg-turq/[0.05] p-6 text-lg leading-relaxed text-text sm:p-7">
          {g.answer}
        </p>

        <div className="mt-10 space-y-6">
          {g.body.map((b, i) => (
            <Body key={i} b={b} />
          ))}
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">Common questions</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {g.faq.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-display font-semibold text-text">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-16 rounded-3xl border border-line bg-ink-2 p-7 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Work out your own number
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Nine questions, two minutes, and a PDF breakdown in your inbox. No call needed.
          </p>
          <div className="mt-7 flex justify-center">
            <Button href="/estimate">Build my estimate</Button>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-bold tracking-tight text-text">Read next</h2>
            <ul className="mt-4 grid gap-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/guides/${r.slug}`}
                    className="block rounded-2xl border border-line p-5 font-display font-semibold text-text transition-colors hover:border-turq/50 hover:text-turq"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
