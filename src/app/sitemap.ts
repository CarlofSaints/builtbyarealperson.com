import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/estimate`, lastModified, changeFrequency: "monthly", priority: 0.9 },
  ];
}
