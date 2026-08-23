import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isBlobConfigured, leadByAccessToken } from "@/lib/store";
import { recommend } from "@/lib/take-on";
import { TakeOnForm } from "@/components/setup/TakeOnForm";
import { Recommended } from "@/components/setup/Recommended";
import { Section, H2, Lead } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Setting your site up",
  // A link sent to one customer has no business in a search index.
  robots: { index: false, follow: false },
};

export default async function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isBlobConfigured()) notFound();

  // Dead, rotated, malformed and invented tokens all end in the same place.
  const lead = await leadByAccessToken(token);
  if (!lead) notFound();

  const first = lead.answers.name.trim().split(/\s+/)[0] || "there";
  const business = lead.answers.business.trim();

  // Already answered: show them what it came out as rather than an empty form
  // they have to fill in twice.
  if (lead.takeOn) {
    return (
      <Section className="u-glow">
        <div className="relative z-10 mx-auto max-w-3xl">
          <H2>Thank you, that is everything I needed</H2>
          <Lead className="mt-4">
            Based on what you told me, here is where I am proposing your site lives. Nothing is
            locked in. If any of it looks wrong, say so and we will change it.
          </Lead>
          <div className="mt-10">
            <Recommended recommendation={recommend(lead.takeOn.answers, lead.answers)} />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="u-glow">
      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="font-mono text-xs text-muted-2">{lead.reference}</p>
        <H2 className="mt-2">
          Right {first}, a few questions before I start
        </H2>
        <Lead className="mt-4">
          These are about where {business || "your site"} should actually live once it is built.
          None of them are technical, and there are no wrong answers. It takes about three minutes
          and it saves a fortnight of confusion later.
        </Lead>
        <p className="mt-4 text-sm text-muted-2">
          If you do not know an answer, pick the option that says so. That is genuinely useful
          information and it is the one I chase first.
        </p>

        <div className="mt-12">
          <TakeOnForm token={token} />
        </div>
      </div>
    </Section>
  );
}
