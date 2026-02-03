// app/casinos/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getCasinoBySlug, getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";
import { getGuidesByCasinoSlug } from "@/lib/guides";
import { jsonLd } from "@/lib/schema";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gold-star-ten.vercel.app"
).replace(/\/$/, "");

type PageProps = {
  params: Promise<{ slug: string }>;
};

type CasinoLite = {
  id: string;
  slug: string;
  name: string;
  rating?: unknown;
  description?: unknown;
  countries?: unknown;
};

type CountryLite = {
  code: string;
  name: string;
  description?: unknown;
};

type GuideLite = {
  slug: string;
  title: string;
};

function formatRating(r: unknown) {
  const n = typeof r === "number" ? r : Number(r);
  if (Number.isFinite(n) && n > 0) return n.toFixed(1);
  return null;
}

function buildBreadcrumbJsonLd(casinoName: string, slug: string) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Casinos", item: `${SITE_URL}/casinos` },
      { "@type": "ListItem", position: 3, name: casinoName, item: `${SITE_URL}/casinos/${slug}` },
    ],
  });
}

/* ------------------------- SSG ------------------------- */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const casinos = (await getCasinos()) as unknown;
  const list = Array.isArray(casinos) ? (casinos as CasinoLite[]) : [];
  return list.map((c) => ({ slug: String(c.slug) }));
}

/* ------------------------- SEO (OG dynamic) ------------------------- */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const casino = (await getCasinoBySlug(slug)) as unknown as CasinoLite | null;

  if (!casino) {
    return {
      title: "Casino not found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${casino.name} Review`;
  const description =
    casino.description != null
      ? String(casino.description)
      : `Read our review of ${casino.name}: bonuses, features, and key details.`;

  const canonicalPath = `/casinos/${casino.slug}`;
  const canonicalAbs = `${SITE_URL}${canonicalPath}`;

  const rating = typeof casino.rating === "number" ? casino.rating.toFixed(1) : "";
  const ogPath =
    `/og?type=casino&title=${encodeURIComponent(title)}` +
    `&subtitle=${encodeURIComponent("Bonuses • Payments • Features")}` +
    (rating ? `&rating=${encodeURIComponent(rating)}` : "");

  const ogAbs = `${SITE_URL}${ogPath}`;

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
export default async function CasinoPage({ params }: PageProps) {
  const { slug } = await params;

  const casino = (await getCasinoBySlug(slug)) as unknown as CasinoLite | null;
  if (!casino) notFound();

  const rating = formatRating(casino.rating);

  // Countries lookup (optional)
  const allCountriesUnknown = (await getCountries()) as unknown;
  const allCountries = Array.isArray(allCountriesUnknown)
    ? (allCountriesUnknown as CountryLite[])
    : [];

  const countryCodes: string[] = Array.isArray(casino.countries)
    ? (casino.countries as unknown[]).map((x) => String(x))
    : [];

  const availableCountries = allCountries.filter((c) => countryCodes.includes(String(c.code)));

  // Related guides
  const relatedGuidesUnknown = (await getGuidesByCasinoSlug(String(casino.slug))) as unknown;
  const relatedGuides = Array.isArray(relatedGuidesUnknown)
    ? (relatedGuidesUnknown as GuideLite[])
    : [];

  // Breadcrumb JSON-LD
  const breadcrumbLd = buildBreadcrumbJsonLd(String(casino.name), String(casino.slug));

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="grid" style={{ gap: 18 }}>
        {/* HERO */}
        <header className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <p className="badge">🎰 Casino Review</p>

            <nav aria-label="Casino page links" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="navlink" href="/casinos">
                ← Back to casinos
              </Link>

              {availableCountries.length > 0 ? (
                <span className="kbd">{availableCountries.length} countries</span>
              ) : (
                <span className="kbd">availability soon</span>
              )}

              {rating ? <span className="kbd">⭐ {rating}</span> : null}
            </nav>
          </div>

          <h1 className="h1" style={{ marginTop: 12 }}>
            {casino.name}
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            {casino.description
              ? String(casino.description)
              : `A clear, structured review of ${casino.name}: rating, key details, and links to guides and countries.`}
          </p>

          <div className="hr" />

          {/* Quick facts */}
          <section aria-label="Quick facts">
            <dl className="grid grid-2">
              <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                <dt className="small">Rating</dt>
                <dd style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>
                  {rating ? `⭐ ${rating} / 5` : "—"}
                </dd>
                <dd className="small" style={{ marginTop: 6 }}>
                  Based on our editorial scoring model.
                </dd>
              </div>

              <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                <dt className="small">Coverage</dt>
                <dd style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>
                  {availableCountries.length > 0 ? `${availableCountries.length} countries` : "Coming soon"}
                </dd>
                <dd className="small" style={{ marginTop: 6 }}>
                  Regional availability can vary by regulation.
                </dd>
              </div>
            </dl>
          </section>
        </header>

        {/* AVAILABLE IN */}
        <section className="card" aria-labelledby="available-in">
          <h2 className="h2" id="available-in">
            Available in
          </h2>
          <p className="p">Countries where this casino is currently listed as available.</p>

          <div className="hr" />

          {availableCountries.length === 0 ? (
            <p className="p">No countries linked yet for this casino.</p>
          ) : (
            <ul className="grid grid-2" aria-label="Countries list">
              {availableCountries.map((c) => (
                <li key={c.code} className="card" style={{ background: "var(--panel)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <Link href={`/countries/${c.code}`}>{c.name}</Link>
                    <span className="small">{c.code}</span>
                  </div>

                  {c.description ? (
                    <p className="small" style={{ marginTop: 8 }}>
                      {String(c.description)}
                    </p>
                  ) : null}
                </li>
              ))}
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

          <p className="p">Guides that mention or explain how to use this casino effectively.</p>

          <div className="hr" />

          {relatedGuides.length === 0 ? (
            <p className="p">No related guides yet.</p>
          ) : (
            <ul className="list" aria-label="Guides list">
              {relatedGuides.map((g) => (
                <li key={g.slug} className="item">
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
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
          <p className="p">
            Keep browsing the catalog — the fastest way to grow internal linking and topical authority.
          </p>

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
      </article>
    </>
  );
}
