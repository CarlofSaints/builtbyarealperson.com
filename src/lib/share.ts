import type { Metadata } from "next";
import { SITE } from "./site";

/**
 * Open Graph and Twitter tags for one page. A page's openGraph REPLACES the
 * layout's whole object rather than merging into it, so siteName and locale
 * are repeated here, and twitter is set too or the card keeps the homepage's
 * text. The share image still comes from app/opengraph-image.jpg.
 */
export function shareMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { type, title, description, url: path, siteName: SITE.name, locale: "en_ZA" },
    twitter: { card: "summary_large_image", title, description },
  };
}
