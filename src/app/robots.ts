import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin is behind a password, but keeping it out of the index means it is
    // never offered up to anyone who was not already looking for it.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/thank-you", "/admin"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
