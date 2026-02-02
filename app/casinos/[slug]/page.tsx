// app/casinos/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getCasinoBySlug, getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";
import { getGuidesByCasinoSlug } from "@/lib/guides";
import { jsonLd } from "@/lib/schema";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

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
  const url = `/casinos/${casino.slug}`;

  const rating = typeof casino.rating === "number" ? casino.rating.toFixed(1) : "";
  const og = `/og?type=casino&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
    "Bonuses • Payments • Features"
  )}${rating ? `&rating=${encodeURIComponent(rating)}` : ""}`;

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

      <div className="grid" style={{ gap: 18 }}>
        {/* HERO */}
        <section className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div className="badge">🎰 Casino Review</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="navlink" href="/casinos">
                ← Back to casinos
              </Link>
              {availableCountries.length > 0 ? (
                <span className="kbd">{availableCountries.length} countries</span>
              ) : (
                <span className="kbd">availability soon</span>
              )}
              {rating ? <span className="kbd">⭐ {rating}</span> : null}
            </div>
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

          {/* Quick facts (safe, optional fields) */}
          <div className="grid grid-2">
            <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
              <div className="small">Rating</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>
                {rating ? `⭐ ${rating} / 5` : "—"}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                Based on our editorial scoring model.
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
              <div className="small">Coverage</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>
                {availableCountries.length > 0 ? `${availableCountries.length} countries` : "Coming soon"}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                Regional availability can vary by regulation.
              </div>
            </div>
          </div>
        </section>

        {/* AVAILABLE IN */}
        <section className="card">
          <h2 className="h2">Available in</h2>
          <p className="p">Countries where this casino is currently listed as available.</p>

          <div className="hr" />

          {availableCountries.length === 0 ? (
            <p className="p">No countries linked yet for this casino.</p>
          ) : (
            <div className="grid grid-2">
              {availableCountries.map((c) => (
                <div key={c.code} className="card" style={{ background: "var(--panel)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <Link href={`/countries/${c.code}`}>{c.name}</Link>
                    <span className="small">{c.code}</span>
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
          <p className="p">Guides that mention or explain how to use this casino effectively.</p>

          <div className="hr" />

          {relatedGuides.length === 0 ? (
            <p className="p">No related guides yet.</p>
          ) : (
            <div className="list">
              {relatedGuides.map((g) => (
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
          <p className="p">
            Keep browsing the catalog — the fastest way to grow internal linking and topical authority.
          </p>
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
