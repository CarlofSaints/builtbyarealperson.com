/**
 * The public marketing site's chrome.
 *
 * This lives in a route group rather than in the root layout so that the admin
 * portal can sit in the same app without inheriting a customer-facing header,
 * footer and scroll-reveal script. Route groups do not appear in the URL, so
 * every page under here keeps the path it always had.
 */

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-turq focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <Reveal />
    </>
  );
}
