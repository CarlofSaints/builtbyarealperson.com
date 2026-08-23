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
    "Websites for South African small businesses, built by one person in days rather than months. AI speeds up the work: it does not do the work. Fixed price up front, from R5,500.",

  /**
   * The address shown on the site and used as the reply-to.
   *
   * Env-driven on purpose: sending from a domain and RECEIVING at it are
   * separate problems. Resend can send as hello@builtbyarealperson.com with no
   * mailbox existing anywhere, but a `mailto:` to an address with no mailbox
   * behind it bounces, and the bounce goes to the customer, not to us. So point
   * this at an address that genuinely receives until the nice one does.
   */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@builtbyarealperson.com",

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
  { href: "/work", label: "My work" },
  { href: "/pricing", label: "Pricing" },
] as const;
