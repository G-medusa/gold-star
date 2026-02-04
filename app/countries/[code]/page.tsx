// app/countries/[code]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getCountryByCode, getCountries } from "@/lib/countries";
import { getCasinos } from "@/lib/casinos";
import { getGuidesByCountryCode } from "@/lib/guides";
import { jsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ code: string }>;
};

type CountryLite = {
  code: string;
  name: string;
  description?: unknown;
};

type CasinoLite = {
  slug: string;
  name: string;
  rating?: unknown;
  description?: unknown;
  countries?: unknown;
};

type GuideLite = {
  slug: string;
  title: string;
};

function codeToFlagEmoji(code: string) {
  const cc = (code ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  const first = A + (cc.charCodeAt(0) - base);
  const second = A + (cc.charCodeAt(1) - base);
  return String.fromCodePoint(first, second);
}

function ratingNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function buildBreadcrumbJsonLd(countryName: string, code: string) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Countries", item: absoluteUrl("/countries") },
      { "@type": "ListItem", position: 3, name: countryName, item: absoluteUrl(`/countries/${code}`) },
    ],
  });
}

/* ------------------------- SSG ------------------------- */
export async function generateStaticParams(): Promise<Array<{ code: string }>> {
  const countriesUnknown = (await getCountries()) as unknown;
  const countries = Array.isArray(countriesUnknown) ? (countriesUnknown as CountryLite[]) : [];
  return countries.map((c) => ({ code: String(c.code) }));
}

/* ------------------------- SEO (dynamic OG) ------------------------- */
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params;
  const country = (await getCountryByCode(code)) as unknown as CountryLite | null;

  if (!country) {
    return {
      title: "Country not found",
      robots: { index: false, follow: false },
    };
  }

  const cc = String(country.code).toUpperCase();
  const flag = codeToFlagEmoji(cc);

  const title = `Best Online Casinos in ${String(country.name)}`;
  const description =
    country.description != null
      ? String(country.description)
      : `Top online casinos available in ${String(country.name)}. Compare options, ratings, and guides.`;

  const canonicalPath = `/countries/${cc}`;
  const canonicalAbs = absoluteUrl(canonicalPath);

  const ogAbs = absoluteUrl(
    `/og?type=country&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
      `Country code: ${cc}`
    )}${flag ? `&flag=${encodeURIComponent(flag)}` : ""}`
  );

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalAbs,
      type: "article",
      images: [{ url: ogAbs, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogAbs],
    },
  };
}

/* ------------------------- PAGE ------------------------- */
export default async function CountryPage({ params }: PageProps) {
  const { code } = await params;

  const country = (await getCountryByCode(code)) as unknown as CountryLite | null;
  if (!country) notFound();

  const cc = String(country.code).toUpperCase();
  const flag = codeToFlagEmoji(cc);

  const casinosUnknown = (await getCasinos()) as unknown;
  const casinos = Array.isArray(casinosUnknown) ? (casinosUnknown as CasinoLite[]) : [];

  const available = casinos.filter((c) => {
    if (!Array.isArray(c.countries)) return false;
    const list = (c.countries as unknown[]).map((x) => String(x).toUpperCase());
    return list.includes(cc);
  });

  // Use normalized cc to avoid case drift between URL param and data
  const relatedGuidesUnknown = (await getGuidesByCountryCode(cc)) as unknown;
  const relatedGuides = Array.isArray(relatedGuidesUnknown)
    ? (relatedGuidesUnknown as GuideLite[])
    : [];

  const breadcrumbLd = buildBreadcrumbJsonLd(String(country.name), cc);

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="grid" style={{ gap: 18 }}>
        {/* HERO */}
        <header className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <p className="badge">🌍 Country</p>

            <nav aria-label="Country page links" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="navlink" href="/countries">
                ← Back to countries
              </Link>
              <span className="kbd">{cc}</span>
              <span className="kbd">{available.length} casinos</span>
            </nav>
          </div>

          <h1 className="h1" style={{ marginTop: 12 }}>
            {flag ? `${flag} ` : ""}
            {String(country.name)}
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            {country.description
              ? String(country.description)
              : `This page lists online casinos available in ${String(
                  country.name
                )}, plus useful guides and internal links.`}
          </p>
        </header>

        {/* CASINOS */}
        <section className="card" aria-labelledby="casinos-available">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2" id="casinos-available">
              Casinos available
            </h2>
            <Link href="/casinos" className="small">
              all casinos →
            </Link>
          </header>

          <p className="p">Casinos currently marked as available for this country.</p>
          <div className="hr" />

          {available.length === 0 ? (
            <p className="p">No casinos linked to this country yet.</p>
          ) : (
            <ul className="grid grid-2" aria-label="Casinos list">
              {available
                .slice()
                .sort((a, b) => ratingNumber(b.rating) - ratingNumber(a.rating))
                .map((c) => {
                  const r = ratingNumber(c.rating);
                  return (
                    <li key={String(c.slug)} className="card" style={{ background: "var(--panel)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <Link href={`/casinos/${String(c.slug)}`}>{String(c.name)}</Link>
                        <span className="small">{r > 0 ? `⭐ ${r.toFixed(1)}` : ""}</span>
                      </div>

                      {c.description ? (
                        <p className="small" style={{ marginTop: 8 }}>
                          {String(c.description)}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        {/* RELATED GUIDES */}
        <section className="card" aria-labelledby="related-guides">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2" id="related-guides">
              Related guides
            </h2>
            <Link href="/guides" className="small">
              all guides →
            </Link>
          </header>

          <p className="p">Guides that are relevant for this country or region.</p>
          <div className="hr" />

          {relatedGuides.length === 0 ? (
            <p className="p">No related guides yet.</p>
          ) : (
            <ul className="list" aria-label="Guides list">
              {relatedGuides.map((g) => (
                <li key={String(g.slug)} className="item">
                  <Link href={`/guides/${String(g.slug)}`}>{String(g.title)}</Link>
                  <span className="small">guide</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* NEXT LINKS */}
        <section className="card" aria-labelledby="explore-more">
          <h2 className="h2" id="explore-more">
            Explore more
          </h2>
          <p className="p">Build topical authority with strong internal linking across sections.</p>
          <div className="hr" />

          <nav aria-label="Explore sections" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="navlink" href="/casinos">
              Casinos
            </Link>
            <Link className="navlink" href="/countries">
              Countries
            </Link>
            <Link className="navlink" href="/guides">
              Guides
            </Link>
          </nav>
        </section>
      </main>
    </>
  );
}
