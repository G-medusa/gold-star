// app/countries/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getCountries } from "@/lib/countries";
import { jsonLd } from "@/lib/schema";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Countries",
  description: "Browse countries and see which online casinos are available in each region.",
  alternates: { canonical: `${SITE_URL}/countries` },
};

type CountryLite = {
  code: string;
  name: string;
  description?: unknown;
};

function buildBreadcrumbJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Countries", item: `${SITE_URL}/countries` },
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

function codeToFlagEmoji(code: string) {
  const cc = (code ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  const first = A + (cc.charCodeAt(0) - base);
  const second = A + (cc.charCodeAt(1) - base);
  return String.fromCodePoint(first, second);
}

export default async function CountriesPage() {
  const countriesUnknown = (await getCountries()) as unknown;
  const countries = Array.isArray(countriesUnknown) ? (countriesUnknown as CountryLite[]) : [];

  // Sort by name
  const sorted = [...countries].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""))
  );

  const breadcrumbLd = buildBreadcrumbJsonLd();

  const itemListLd = buildItemListJsonLd(
    sorted.map((c) => ({
      name: String(c.name ?? c.code ?? "Country"),
      url: `${SITE_URL}/countries/${String(c.code)}`,
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
            Countries
          </h1>
          <p className="p" style={{ maxWidth: 820 }}>
            Country pages show which casinos are available in each region and link to relevant guides.
          </p>
        </section>

        {/* Grid */}
        {sorted.length === 0 ? (
          <section className="card">
            <p className="p">No countries yet.</p>
          </section>
        ) : (
          <section className="grid grid-2">
            {sorted.map((c) => {
              const flag = codeToFlagEmoji(String(c.code ?? ""));
              const name = String(c.name ?? "Country");
              const code = String(c.code ?? "");

              return (
                <article key={code} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <h2 className="h2" style={{ margin: 0 }}>
                      <Link href={`/countries/${code}`}>
                        {flag ? `${flag} ` : ""}
                        {name}
                      </Link>
                    </h2>
                    <span className="small">{code}</span>
                  </div>

                  <p className="p">
                    {c.description
                      ? String(c.description)
                      : `See casinos available in ${name} and related guides.`}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <span className="kbd">casinos</span>
                    <span className="kbd">guides</span>
                    <span className="kbd">breadcrumbs</span>
                    <span className="kbd">itemlist</span>
                  </div>

                  <div className="hr" />

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <Link href={`/countries/${code}`}>Open country page →</Link>
                    <span className="small">Region code: {code}</span>
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
