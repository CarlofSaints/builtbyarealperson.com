import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and refunds",
  description: `The terms ${SITE.name} works on, including refunds.`,
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    h: "Who you are dealing with",
    p: [
      `${SITE.name} is invoiced by ${SITE.legal.name}, registration ${SITE.legal.registration}. The company is not VAT registered, so no VAT is added to any price.`,
    ],
  },
  {
    h: "Estimates and quotes",
    p: [
      "An estimate from this site is preliminary and commits neither of us. Work starts only once you have accepted a fixed quote in writing, and that quote sets out what is included.",
    ],
  },
  {
    h: "Payment",
    p: [
      "Payment is 50% to start and 50% on the day the site goes live. Getting an estimate or a quote costs nothing, and nothing is owed until you accept a quote.",
    ],
  },
  {
    h: "Refunds",
    p: [
      "You get a refund of what you have paid, including the 50% paid to start, if I could not execute what you asked for in the accepted quote. Refunds are not given for any other reason, including a change of mind once the work has been delivered as quoted.",
      "Nothing in these terms takes away any right you have under the Consumer Protection Act or other South African law that cannot be excluded.",
    ],
  },
  {
    h: "What you own",
    p: [
      "Your domain, your site, your content and your accounts are yours. I keep the reusable toolkit I use across projects.",
    ],
  },
  {
    h: "Law",
    p: ["These terms are governed by South African law."],
  },
];

export default function TermsPage() {
  return (
    <section className="u-glow relative overflow-hidden px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="relative mx-auto max-w-3xl">
        <Eyebrow>Terms</Eyebrow>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Terms and refunds
        </h1>
        {SECTIONS.map((s) => (
          <div key={s.h} className="mt-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-text">{s.h}</h2>
            {s.p.map((t) => (
              <p key={t} className="mt-3 text-[17px] leading-relaxed text-muted">{t}</p>
            ))}
          </div>
        ))}
        <p className="mt-10 text-[17px] leading-relaxed text-muted">
          Questions:{" "}
          <a href={`mailto:${SITE.email}`} className="text-turq underline-offset-4 hover:underline">
            {SITE.email}
          </a>
        </p>
      </div>
    </section>
  );
}
