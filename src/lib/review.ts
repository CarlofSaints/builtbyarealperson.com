/**
 * Asking for a review, at the only moment anybody says yes.
 *
 * The day a site goes live is the day a client is most pleased with you. Six
 * months later they are busy, the delight has worn off, and asking feels like
 * begging. So the ask happens at handover or not at all.
 *
 * The part that is usually skipped is CONSENT. A quote is worthless if you
 * cannot publish it, and publishing somebody's name without asking is a way to
 * lose the client you just impressed. So permission is asked at the same time,
 * separately from the rating, with the option to say a lovely thing and still
 * not want it on a website. Both answers are useful: one is marketing, the
 * other is a private signal about whether the work was actually any good.
 */

export type ReviewConsent = "full" | "first-name" | "anonymous" | "private";

export type Review = {
  /** 1 to 5. The only required field. */
  stars: number;
  quote: string;
  consent: ReviewConsent;
  /** What they would like to be called, if they want to correct it. */
  attributionName: string;
  /** Anything they would rather say to me than to the internet. */
  privateNote: string;
  at: string;
};

export const CONSENT_CHOICES: { id: ReviewConsent; label: string; note: string }[] = [
  {
    id: "full",
    label: "Yes, with my name and my business",
    note: "The most useful kind, and the one people actually believe.",
  },
  {
    id: "first-name",
    label: "Yes, but first name and trade only",
    note: 'Like "Thandi, plumber in Benoni". No business name.',
  },
  {
    id: "anonymous",
    label: "Yes, but keep me anonymous",
    note: "No name, no business. Just the words.",
  },
  {
    id: "private",
    label: "No, this is just for you",
    note: "Say whatever you actually think. It goes nowhere.",
  },
];

export const STAR_LABELS: Record<number, string> = {
  1: "Bad",
  2: "Not great",
  3: "Fine",
  4: "Good",
  5: "Excellent",
};

/** Can this be put on the website, and how should it be signed? */
export function attribution(review: Review, name: string, business: string): string | null {
  switch (review.consent) {
    case "full":
      return [review.attributionName.trim() || name.trim(), business.trim()].filter(Boolean).join(", ");
    case "first-name":
      return (review.attributionName.trim() || name.trim()).split(/\s+/)[0] || null;
    case "anonymous":
      return "Anonymous";
    case "private":
      return null;
  }
}

export function isPublishable(review: Review | undefined): boolean {
  return Boolean(review && review.consent !== "private" && review.quote.trim().length > 0);
}

/** Rounded to a half, the way a rating is usually shown. */
export function averageStars(reviews: Review[]): number | null {
  if (!reviews.length) return null;
  const total = reviews.reduce((sum, r) => sum + r.stars, 0);
  return Math.round((total / reviews.length) * 2) / 2;
}
