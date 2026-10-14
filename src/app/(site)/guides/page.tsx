import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { GUIDES } from "@/lib/guides";
import { shareMetadata } from "@/lib/share";

const TITLE = "Small Business Website Guides for South Africa";
const DESCRIPTION =
  "Straight answers to the questions small business owners ask before buying a website: what it costs, how long it takes, which domain to use and whether you need one at all.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  ...shareMetadata({ title: TITLE, description: DESCRIPTION, path: "/guides" }),
};

export default function GuidesPage() {
  return (
    <section className="u-glow relative overflow-hidden px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="u-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <Eyebrow>Guides</Eyebrow>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Straight answers,
          <br />
          <span className="u-grad-text">before you spend a rand.</span>
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-muted sm:text-lg">
          The questions people ask me before they buy a website, answered properly. Every
          price in them comes from the same rate card as the estimator.
        </p>

        <ul className="mt-12 grid gap-4">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="u-card u-card-lift group block p-6 sm:p-7">
                <h2 className="font-display text-xl font-bold tracking-tight text-text transition-colors group-hover:text-turq">
                  {g.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
