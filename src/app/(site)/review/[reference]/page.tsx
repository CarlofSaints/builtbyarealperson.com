import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isBlobConfigured, readLead } from "@/lib/store";
import { ReviewForm } from "@/components/setup/ReviewForm";
import { Section, H2, Lead } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "How did that go?",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!isBlobConfigured()) notFound();
  const lead = await readLead(reference);
  if (!lead) notFound();

  const first = lead.answers.name.trim().split(/\s+/)[0] || "there";

  if (lead.review) {
    return (
      <Section className="u-glow">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <H2>Thank you, genuinely</H2>
          <Lead className="mt-4">
            {lead.review.stars >= 4
              ? "That is a good day. It matters more than you would think when there is only one of you."
              : "Thank you for being straight about it. That is more useful to me than a five would have been, and I will come back to you about it."}
          </Lead>
        </div>
      </Section>
    );
  }

  return (
    <Section className="u-glow">
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="font-mono text-xs text-muted-2">{lead.reference}</p>
        <H2 className="mt-2">Well {first}, that is yours and it is live</H2>
        <Lead className="mt-4">
          Two questions, about a minute. There is no marketing team here, so this is the only
          way I find out whether the thing I do is any good.
        </Lead>
        <div className="mt-10">
          <ReviewForm reference={lead.reference} firstName={first} />
        </div>
      </div>
    </Section>
  );
}
