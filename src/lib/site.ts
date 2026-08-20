/**
 * Site-wide constants. Anything you might want to change without touching a
 * component lives here or in an environment variable.
 */

export const SITE = {
  name: "Built By A Real Person",
  domain: "builtbyarealperson.com",
  url: "https://builtbyarealperson.com",
  tagline: "A real person builds your website. AI just makes me fast.",
  description:
    "Websites for South African small businesses, built by one person in days rather than months. AI speeds up the work — it does not do the work. Fixed price up front, from R5,500.",

  /** The public-facing address. Set up as a forwarder to wherever you read mail. */
  email: "hello@builtbyarealperson.com",

  /** Shown in the emails and on the booking step. Falls back to a mailto flow. */
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "",

  /** Optional. Leave blank and the site simply will not show a phone number. */
  phone: process.env.NEXT_PUBLIC_PHONE || "",

  /** Who is behind it. Used in the emails and the about copy. */
  builder: {
    name: "Carl",
    role: "The whole company",
    location: "South Africa",
  },
} as const;

export const NAV_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#honest", label: "The AI question" },
  { href: "/pricing", label: "Pricing" },
] as const;
