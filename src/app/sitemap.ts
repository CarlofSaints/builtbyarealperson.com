import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { GUIDES } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/work`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/estimate`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/guides`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${SITE.url}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
