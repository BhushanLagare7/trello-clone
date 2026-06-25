import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Generates the XML sitemap for search engine crawlers.
 *
 * Only includes publicly accessible pages (the marketing landing page).
 * Authenticated dashboard/board pages are excluded since they require
 * sign-in and should not be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
