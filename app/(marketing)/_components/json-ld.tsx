import { siteConfig } from "@/config/site";

/**
 * Renders JSON-LD structured data (schema.org) for SEO.
 *
 * Uses the SoftwareApplication schema type so search engines can display
 * rich results (app name, category, pricing) in search listings.
 */
export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
