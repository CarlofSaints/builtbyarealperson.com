import type { Metadata } from "next";
import Link from "next/link";
import { EstimateForm } from "@/components/estimate/EstimateForm";
import { ACCURACY_BAND } from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "Build your estimate",
  description:
    "Nine questions, two minutes, and a real number. The estimate updates as you answer and a PDF breakdown is emailed to you immediately.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  return (
    <div className="u-glow relative overflow-hidden px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-12 max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Work out what it costs.
            <br />
            <span className="u-grad-text">Right now, on your own.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-muted sm:text-lg">
            Nine questions. The number on the right moves as you answer, using the same
            rate card that is{" "}
            <Link href="/pricing" className="text-turq underline-offset-4 hover:underline">
              published on this site
            </Link>
            . Nothing here commits you to anything.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-muted-2">
            {[
              "No account needed",
              "PDF emailed immediately",
              `Final quote within ${Math.round(ACCURACY_BAND * 100)}%`,
              "No mailing list",
            ].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="inline-block h-1 w-1 rounded-full bg-turq" aria-hidden="true" />
                {t}
              </span>
            ))}
          </div>
        </header>

        <EstimateForm />
      </div>
    </div>
  );
}
