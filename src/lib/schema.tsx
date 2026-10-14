/**
 * Structured data (schema.org JSON-LD) for Google. Every value here is read
 * from SITE, the rate card or the guides, so it can never claim something the
 * visible page does not say. Google ignores, and can penalise, markup that
 * disagrees with the page.
 */

import { SITE } from "./site";
import { FROM_PRICE, OFFERED_SITE_SIZES, formatMoney } from "./rate-card";
import type { Guide } from "./guides";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` escaped so a "</script>" inside any string cannot end the tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const BUSINESS_ID = `${SITE.url}/#business`;
const PERSON_ID = `${SITE.url}/#builder`;

/**
 * The person behind the business. First name only, on purpose: the pitch is
 * that a real person builds the site, not who else that person works for.
 */
/** A short business node, so pages other than home can point at the same entity. */
const businessRef = {
  "@type": "ProfessionalService",
  "@id": BUSINESS_ID,
  name: SITE.name,
  url: SITE.url,
};

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.builder.name,
  jobTitle: "Website designer and developer",
  worksFor: { "@id": BUSINESS_ID },
};

export function homeSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        inLanguage: "en-ZA",
        publisher: { "@id": BUSINESS_ID },
      },
      {
        "@type": "ProfessionalService",
        "@id": BUSINESS_ID,
        name: SITE.name,
        description: SITE.description,
        url: SITE.url,
        email: SITE.email,
        ...(SITE.phone ? { telephone: SITE.phone } : {}),
        image: `${SITE.url}/opengraph-image.jpg`,
        logo: `${SITE.url}/icon.png`,
        areaServed: { "@type": "Country", name: "South Africa" },
        priceRange: `From ${formatMoney(FROM_PRICE)}`,
        serviceType: "Website design and development",
        founder: { "@id": PERSON_ID },
      },
      person,
      faqPage(faq, `${SITE.url}/#faq`),
    ],
  };
}

/** The build prices as offers, matching the rows on /pricing. */
export function pricingSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [businessRef, {
    "@type": "OfferCatalog",
    name: `${SITE.name} website prices`,
    url: `${SITE.url}/pricing`,
    itemListElement: OFFERED_SITE_SIZES.map((s) => ({
      "@type": "Offer",
      name: s.label,
      description: s.blurb,
      price: s.price,
      priceCurrency: "ZAR",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: s.price,
        priceCurrency: "ZAR",
        valueAddedTaxIncluded: false,
      },
      seller: { "@id": BUSINESS_ID },
    })),
  }],
  };
}

function faqPage(faq: { q: string; a: string }[], id?: string) {
  return {
    "@type": "FAQPage",
    ...(id ? { "@id": id } : {}),
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function guideSchema(g: Guide) {
  const url = `${SITE.url}/guides/${g.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.title,
        description: g.description,
        url,
        mainEntityOfPage: url,
        datePublished: g.published,
        dateModified: g.updated,
        inLanguage: "en-ZA",
        image: `${SITE.url}/opengraph-image.jpg`,
        author: { "@id": PERSON_ID },
        publisher: { "@id": BUSINESS_ID },
      },
      businessRef,
      person,
      faqPage(g.faq),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE.url}/guides` },
          { "@type": "ListItem", position: 3, name: g.title, item: url },
        ],
      },
    ],
  };
}
