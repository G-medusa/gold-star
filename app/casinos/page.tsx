// app/casinos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getCasinos } from "@/lib/casinos";
import { jsonLd } from "@/lib/schema";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Online Casino Reviews",
  description:
    "Browse online casino reviews with ratings, key features, and quick links to country availability and guides.",
  alternates: { canonical: `${SITE_URL}/casinos` },
};

type CasinoLite = {
  slug: string;
  name: string;
  rating?: unknown;
  description?: unknown;
  countries?: unknown;
};

function ratingNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatRating(r: unknown) {
  const n = ratingNumber(r);
  if (n > 0) return n.toFixed(1);
  return null;
}

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

  // Keep ItemList reasonably sized to avoid huge JSON-LD on large catalogs.
  const itemListLd = buildItemListJsonLd(
    sorted.slice(0, 200).map((c) => ({
      name: String(c.name ?? c.slug ?? "Casino"),
      url: `${SITE_URL}/casinos/${String(c.slug)}`,
    }))
  );

  return (
    <main className="grid" style={{ gap: 18 }}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      {/* Header */}
      <section className="card" style={{ padding: 24 }}>
        <header className="grid" style={{ gap: 12, maxWidth: 920 }}>
          <span className="badge">⭐ Gold Star</span>

          <h1 className="h1" style={{ margin: 0 }}>
            Online casino reviews
          </h1>

          <p className="p" style={{ margin: 0 }}>
            Browse casino profiles with a consistent structure: rating, key highlights, and links to
            country availability and related guides. This page is a catalog — open a casino to see full
            details (bonuses, payments, mobile experience, withdrawals, and practical notes).
          </p>

          <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <Link className="navlink" href="/countries">
              Casinos by country
            </Link>
            <Link className="navlink" href="/guides">
              Gambling guides
            </Link>
          </nav>
        </header>
      </section>

      {/* How we shortlist */}
      <section className="card">
        <h2 className="h2">How we evaluate casinos</h2>
        <p className="p">
          We aim for clear, comparable reviews. Ratings are not “marketing scores” — they summarize the
          overall experience based on the same checklist.
        </p>

        <ul className="p">
          <li>Bonus clarity: wagering requirements, restrictions, and transparency</li>
          <li>Payments: supported methods, fees (if any), and typical withdrawal speed</li>
          <li>Mobile experience: usability, performance, and key features on phones</li>
          <li>Account rules: verification (KYC), limits, and support responsiveness</li>
          <li>Reliability signals: reputation, user reports, and recurring issues (when applicable)</li>
        </ul>
      </section>

      {/* Catalog */}
      {sorted.length === 0 ? (
        <section className="card">
          <h2 className="h2">Casino catalog</h2>
          <p className="p">No casinos yet.</p>
        </section>
      ) : (
        <section aria-label="Casino catalog" className="grid grid-2">
          {sorted.map((c) => {
            const slug = String(c.slug);
            const name = String(c.name ?? slug ?? "Casino");
            const rating = formatRating(c.rating);

            const countriesCount = Array.isArray(c.countries) ? c.countries.length : 0;

            const subtitleBits: string[] = [];
            if (rating) subtitleBits.push(`⭐ ${rating}`);
            if (countriesCount > 0) subtitleBits.push(`Available in ${countriesCount} region(s)`);

            const subtitle = subtitleBits.join(" · ");

            return (
              <article key={slug} className="card">
                <header style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <h2 className="h2" style={{ margin: 0 }}>
                    <Link href={`/casinos/${slug}`}>{name}</Link>
                  </h2>
                  {rating ? <span className="small">⭐ {rating}</span> : <span className="small" />}
                </header>

                <p className="p" style={{ marginTop: 10 }}>
                  {c.description
                    ? String(c.description)
                    : "Open the review for bonuses, payments, mobile experience, and key notes."}
                </p>

                {subtitle ? <p className="small">{subtitle}</p> : <p className="small"> </p>}

                <div className="hr" />

                <nav style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <Link href={`/casinos/${slug}`}>Open review →</Link>
                  {countriesCount > 0 ? (
                    <Link className="small" href="/countries">
                      See countries →
                    </Link>
                  ) : (
                    <span className="small">Availability: coming soon</span>
                  )}
                </nav>
              </article>
            );
          })}
        </section>
      )}

      {/* Note / disclosure placeholder */}
      <section className="card">
        <h2 className="h2">Before you sign up</h2>
        <ul className="p">
          <li>Read bonus terms carefully (wagering requirements and excluded games vary).</li>
          <li>Check withdrawal methods and typical processing times.</li>
          <li>Expect verification (KYC) for most withdrawals and higher limits.</li>
          <li>Play responsibly — treat gambling as entertainment, not income.</li>
        </ul>
      </section>
    </main>
  );
}
