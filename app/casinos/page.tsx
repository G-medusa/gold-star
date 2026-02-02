// app/casinos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getCasinos } from "@/lib/casinos";
import { jsonLd } from "@/lib/schema";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Casinos",
  description: "Browse online casino reviews, ratings, and key features.",
  alternates: { canonical: `${SITE_URL}/casinos` },
};

type CasinoLite = {
  slug: string;
  name: string;
  rating?: unknown;
  description?: unknown;
  countries?: unknown;
};

function buildBreadcrumbJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Casinos", item: `${SITE_URL}/casinos` },
    ],
  });
}

function buildItemListJsonLd(items: Array<{ name: string; url: string }>) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      url: it.url,
    })),
  });
}

function ratingNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatRating(r: unknown) {
  const n = ratingNumber(r);
  if (n > 0) return n.toFixed(1);
  return null;
}

export default async function CasinosPage() {
  const casinosUnknown = (await getCasinos()) as unknown;
  const casinos = Array.isArray(casinosUnknown) ? (casinosUnknown as CasinoLite[]) : [];

  // Sort: best rating first, then name
  const sorted = [...casinos].sort((a, b) => {
    const ar = ratingNumber(a.rating);
    const br = ratingNumber(b.rating);
    if (br !== ar) return br - ar;
    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
  });

  const breadcrumbLd = buildBreadcrumbJsonLd();

  const itemListLd = buildItemListJsonLd(
    sorted.map((c) => ({
      name: String(c.name ?? c.slug ?? "Casino"),
      url: `${SITE_URL}/casinos/${String(c.slug)}`,
    }))
  );

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <div className="grid" style={{ gap: 18 }}>
        {/* Header */}
        <section className="card" style={{ padding: 22 }}>
          <div className="badge">⭐ Gold Star</div>
          <h1 className="h1" style={{ marginTop: 10 }}>
            Casinos
          </h1>
          <p className="p" style={{ maxWidth: 820 }}>
            Browse our casino reviews. Each profile includes rating, key highlights, structured data,
            and internal links to countries and guides.
          </p>
        </section>

        {/* Grid of cards */}
        {sorted.length === 0 ? (
          <section className="card">
            <p className="p">No casinos yet.</p>
          </section>
        ) : (
          <section className="grid grid-2">
            {sorted.map((c) => {
              const rating = formatRating(c.rating);
              const countriesCount = Array.isArray(c.countries) ? c.countries.length : 0;

              const chips: string[] = [];
              if (countriesCount > 0) chips.push(`${countriesCount} countries`);
              if (rating) chips.push(`⭐ ${rating}`);

              return (
                <article key={String(c.slug)} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <h2 className="h2" style={{ margin: 0 }}>
                      <Link href={`/casinos/${String(c.slug)}`}>{String(c.name)}</Link>
                    </h2>
                    <span className="small">{rating ? `⭐ ${rating}` : ""}</span>
                  </div>

                  <p className="p">
                    {c.description
                      ? String(c.description)
                      : "Review with key features, rating, and availability by country."}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {chips.map((chip) => (
                      <span key={chip} className="kbd">
                        {chip}
                      </span>
                    ))}
                    <span className="kbd">review</span>
                    <span className="kbd">faq</span>
                    <span className="kbd">breadcrumbs</span>
                  </div>

                  <div className="hr" />

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <Link href={`/casinos/${String(c.slug)}`}>Open review →</Link>
                    {countriesCount > 0 ? (
                      <span className="small">Available in {countriesCount} region(s)</span>
                    ) : (
                      <span className="small">Availability: coming soon</span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}
