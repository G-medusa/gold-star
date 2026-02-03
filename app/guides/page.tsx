// app/guides/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getGuides } from "@/lib/guides";
import { jsonLd } from "@/lib/schema";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gold-star-ten.vercel.app"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Guides",
  description: "Guides and tips to help you choose and use online casinos.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

type GuideLite = {
  slug: string;
  title: string;
  description?: unknown;
  relatedCasinos?: unknown;
  relatedCountries?: unknown;
};

function buildBreadcrumbJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
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

export default async function GuidesPage() {
  const guidesUnknown = (await getGuides()) as unknown;
  const guides = Array.isArray(guidesUnknown) ? (guidesUnknown as GuideLite[]) : [];

  const sorted = [...guides].sort((a, b) =>
    String(a.title ?? "").localeCompare(String(b.title ?? ""))
  );

  const breadcrumbLd = buildBreadcrumbJsonLd();

  const itemListLd = buildItemListJsonLd(
    sorted.map((g) => ({
      name: String(g.title ?? g.slug ?? "Guide"),
      url: `${SITE_URL}/guides/${String(g.slug)}`,
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

      <article className="grid" style={{ gap: 18 }}>
        {/* HEADER */}
        <header className="card" style={{ padding: 22 }}>
          <p className="badge">⭐ Gold Star</p>
          <h1 className="h1" style={{ marginTop: 10 }}>
            Guides
          </h1>
          <p className="p" style={{ maxWidth: 820 }}>
            Practical guides about choosing casinos, payments, bonuses, and responsible play. Each guide
            links to related casinos and countries.
          </p>
        </header>

        {/* LIST */}
        {sorted.length === 0 ? (
          <section className="card">
            <p className="p">No guides yet.</p>
          </section>
        ) : (
          <section aria-labelledby="guides-list">
            <h2 id="guides-list" className="sr-only">
              Guides list
            </h2>

            <ul className="grid grid-2">
              {sorted.map((g) => {
                const title = String(g.title ?? "Guide");
                const desc = g.description
                  ? String(g.description)
                  : "Step-by-step guide with practical tips and internal links.";

                const casinosCount = Array.isArray(g.relatedCasinos) ? g.relatedCasinos.length : 0;
                const countriesCount = Array.isArray(g.relatedCountries) ? g.relatedCountries.length : 0;

                return (
                  <li key={String(g.slug)}>
                    <article className="card">
                      <h3 className="h2" style={{ margin: 0 }}>
                        <Link href={`/guides/${String(g.slug)}`}>{title}</Link>
                      </h3>

                      <p className="p">{desc}</p>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        <span className="kbd">guide</span>
                        <span className="kbd">faq</span>
                        {casinosCount > 0 ? <span className="kbd">{casinosCount} casinos</span> : null}
                        {countriesCount > 0 ? <span className="kbd">{countriesCount} countries</span> : null}
                      </div>

                      <div className="hr" />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <Link href={`/guides/${String(g.slug)}`}>Read guide →</Link>
                        <span className="small">Internal linking ready</span>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
