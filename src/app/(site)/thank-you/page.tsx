import type { Metadata } from "next";
import { Button, Card, Check } from "@/components/ui";
import { SITE } from "@/lib/site";
import { ACCURACY_BAND } from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "Estimate sent",
  description: "Your preliminary estimate is on its way.",
  robots: { index: false, follow: false },
};

const NEXT = [
  {
    title: "Check your inbox",
    body: "A PDF breakdown should be there within a minute or two. If it is not, look in spam. If it is not there either, email me and I will send it again by hand.",
  },
  {
    title: "I read it myself, today",
    body: "There is no team and no queue. Your answers land in my inbox at the same moment they land in yours.",
  },
  {
    title: "A booking link follows shortly",
    body: "Later today you will get a second, shorter email with a link to book a 30-minute Teams call at a time that suits you. That call is where the estimate turns into a fixed quote.",
  },
  {
    title: "Nothing is owed",
    body: `No deposit is taken and nothing is committed until you have accepted a fixed written quote, and that quote will land within ${Math.round(
      ACCURACY_BAND * 100,
    )}% of the estimate you just received.`,
  },
];

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const reference = (ref ?? "").trim().slice(0, 40);

  return (
    <div className="u-glow relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
      <div className="u-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-turq/30 bg-turq/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-turq">
            <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          That is on its way.
          <br />
          <span className="u-grad-text">Thank you.</span>
        </h1>

        <p className="mt-6 text-[17px] leading-relaxed text-muted sm:text-lg">
          Your preliminary estimate has been emailed to you as a PDF, and a copy has
          landed in my inbox.
        </p>

        {reference ? (
          <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4">
            <span className="text-sm text-muted-2">Your reference</span>
            <span className="font-display text-lg font-bold tracking-wide text-turq">{reference}</span>
            <span className="text-sm text-muted-2">Quote it if you write to me.</span>
          </div>
        ) : null}

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {NEXT.map((item) => (
            <Card key={item.title} className="h-full">
              <div className="flex items-start gap-3">
                <Check />
                <div>
                  <h2 className="font-display text-[17px] font-bold text-text">{item.title}</h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-surface/40 p-7">
          <h2 className="font-display text-xl font-bold text-text">
            Nothing arrived, or something looks wrong?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Email me directly at{" "}
            <a href={`mailto:${SITE.email}`} className="text-turq underline-offset-4 hover:underline">
              {SITE.email}
            </a>
            {reference ? (
              <>
                {" "}
                and quote <span className="font-semibold text-text">{reference}</span>
              </>
            ) : null}
            . A real person will reply. That is rather the point.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button href="/" variant="ghost">
            Back to the website
          </Button>
          <Button href="/pricing" variant="ghost">
            Read the rate card again
          </Button>
        </div>
      </div>
    </div>
  );
}
