// app/guides/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getGuides } from "@/lib/guides";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Guides",
  description: "Guides and tips to help you choose and use online casinos.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

function buildBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
    ],
  };
}

function buildItemListJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

export default async function GuidesPage() {
  const guides = await getGuides();

  // Sort by title (if you later add dates, we can sort by date desc)
  const sorted = [...guides].sort((a: any, b: any) =>
    String(a?.title ?? "").localeCompare(String(b?.title ?? ""))
  );

  const breadcrumbLd = buildBreadcrumbJsonLd();

  const itemListLd = buildItemListJsonLd(
    sorted.map((g: any) => ({
      name: String(g.title ?? g.slug ?? "Guide"),
      url: `${SITE_URL}/guides/${g.slug}`,
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
            Guides
          </h1>
          <p className="p" style={{ maxWidth: 820 }}>
            Practical guides about choosing casinos, payments, bonuses, and responsible play. Each guide
            links to related casinos and countries.
          </p>
        </section>

        {/* Grid */}
        {sorted.length === 0 ? (
          <section className="card">
            <p className="p">No guides yet.</p>
          </section>
        ) : (
          <section className="grid grid-2">
            {sorted.map((g: any) => {
              const title = String(g.title ?? "Guide");
              const desc = g.description
                ? String(g.description)
                : "Step-by-step guide with practical tips and internal links.";

              const casinosCount = Array.isArray(g.relatedCasinos) ? g.relatedCasinos.length : 0;
              const countriesCount = Array.isArray(g.relatedCountries) ? g.relatedCountries.length : 0;

              return (
                <article key={g.slug} className="card">
                  <h2 className="h2" style={{ margin: 0 }}>
                    <Link href={`/guides/${g.slug}`}>{title}</Link>
                  </h2>

                  <p className="p">{desc}</p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <span className="kbd">guide</span>
                    <span className="kbd">faq</span>
                    {casinosCount > 0 ? <span className="kbd">{casinosCount} casinos</span> : null}
                    {countriesCount > 0 ? <span className="kbd">{countriesCount} countries</span> : null}
                  </div>

                  <div className="hr" />

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <Link href={`/guides/${g.slug}`}>Read guide →</Link>
                    <span className="small">Internal linking ready</span>
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
