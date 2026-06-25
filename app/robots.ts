import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Generates robots.txt directives for search engine crawlers.
 *
 * Allows crawling of all public pages while disallowing:
 * - /api/ routes (server actions, webhooks)
 * - Authentication pages (/sign-in/, /sign-up/, /select-org/)
 *
 * NOTE: /_next/ is intentionally NOT disallowed — crawlers need
 * render-critical CSS and JS to properly index the site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/sign-in/", "/sign-up/", "/select-org/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
