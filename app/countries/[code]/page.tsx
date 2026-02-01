// app/countries/[code]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getCountryByCode, getCountries } from "@/lib/countries";
import { getCasinos } from "@/lib/casinos";
import { getGuidesByCountryCode } from "@/lib/guides";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

type PageProps = {
  params: Promise<{ code: string }>;
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

function buildBreadcrumbJsonLd(countryName: string, code: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Countries", item: `${SITE_URL}/countries` },
      { "@type": "ListItem", position: 3, name: countryName, item: `${SITE_URL}/countries/${code}` },
    ],
  };
}

/* ------------------------- SSG ------------------------- */
export async function generateStaticParams(): Promise<Array<{ code: string }>> {
  const countries = await getCountries();
  return countries.map((c: any) => ({ code: c.code }));
}

/* ------------------------- SEO (dynamic OG) ------------------------- */
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params;
  const country = await getCountryByCode(code);

  if (!country) {
    return {
      title: "Country not found",
      robots: { index: false, follow: false },
    };
  }

  const flag = codeToFlagEmoji(String(country.code));
  const title = `Best Online Casinos in ${country.name}`;
  const description =
    country.description?.toString() ||
    `Top online casinos available in ${country.name}. Compare options, ratings, and guides.`;
  const url = `/countries/${country.code}`;

  const og = `/og?type=country&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
    `Country code: ${country.code}`
  )}${flag ? `&flag=${encodeURIComponent(flag)}` : ""}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [og],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

/* ------------------------- PAGE ------------------------- */
export default async function CountryPage({ params }: PageProps) {
  const { code } = await params;

  const country = await getCountryByCode(code);
  if (!country) notFound();

  const flag = codeToFlagEmoji(String(country.code));

  const casinos = await getCasinos();
  const available = casinos.filter((c: any) =>
    Array.isArray(c.countries) ? c.countries.includes(country.code) : false
  );

  const relatedGuides = await getGuidesByCountryCode(country.code);

  const breadcrumbLd = buildBreadcrumbJsonLd(String(country.name), String(country.code));

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="grid" style={{ gap: 18 }}>
        {/* HERO */}
        <section className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div className="badge">🌍 Country</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="navlink" href="/countries">
                ← Back to countries
              </Link>
              <span className="kbd">{country.code}</span>
              <span className="kbd">{available.length} casinos</span>
            </div>
          </div>

          <h1 className="h1" style={{ marginTop: 12 }}>
            {flag ? `${flag} ` : ""}
            {country.name}
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            {country.description
              ? String(country.description)
              : `This page lists online casinos available in ${country.name}, plus useful guides and internal links.`}
          </p>
        </section>

        {/* CASINOS */}
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Casinos available</h2>
            <Link href="/casinos" className="small">
              all casinos →
            </Link>
          </div>
          <p className="p">Casinos currently marked as available for this country.</p>

          <div className="hr" />

          {available.length === 0 ? (
            <p className="p">No casinos linked to this country yet.</p>
          ) : (
            <div className="grid grid-2">
              {available
                .slice()
                .sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
                .map((c: any) => (
                  <div key={c.slug} className="card" style={{ background: "var(--panel)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <Link href={`/casinos/${c.slug}`}>{c.name}</Link>
                      <span className="small">
                        {typeof c.rating === "number" ? `⭐ ${c.rating.toFixed(1)}` : ""}
                      </span>
                    </div>
                    {c.description ? (
                      <p className="small" style={{ marginTop: 8 }}>
                        {String(c.description)}
                      </p>
                    ) : null}
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* RELATED GUIDES */}
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Related guides</h2>
            <Link href="/guides" className="small">
              all guides →
            </Link>
          </div>
          <p className="p">Guides that are relevant for this country or region.</p>

          <div className="hr" />

          {relatedGuides.length === 0 ? (
            <p className="p">No related guides yet.</p>
          ) : (
            <div className="list">
              {relatedGuides.map((g: any) => (
                <div key={g.slug} className="item">
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  <span className="small">guide</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NEXT LINKS */}
        <section className="card">
          <h2 className="h2">Explore more</h2>
          <p className="p">Build topical authority with strong internal linking across sections.</p>
          <div className="hr" />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="navlink" href="/casinos">
              Casinos
            </Link>
            <Link className="navlink" href="/countries">
              Countries
            </Link>
            <Link className="navlink" href="/guides">
              Guides
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
