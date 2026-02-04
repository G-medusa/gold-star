// app/guides/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getGuides, getGuideBySlug } from "@/lib/guides";
import { getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";
import { jsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type GuideLite = {
  slug: string;
  title: string;
  description?: unknown;
  content?: unknown;
  faq?: unknown;
  relatedCasinos?: unknown;
  relatedCountries?: unknown;
};

type CasinoLite = {
  slug: string;
  name: string;
  rating?: unknown;
  description?: unknown;
};

type CountryLite = {
  code: string;
  name: string;
  description?: unknown;
};

type FAQItem = { question: string; answer: string };

function buildBreadcrumbJsonLd(title: string, slug: string) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(`/guides/${slug}`) },
    ],
  });
}

function buildFaqJsonLd(faq: FAQItem[]) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer,
      },
    })),
  });
}

function ratingNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.map((v) => String(v));
}

function toFaqArray(x: unknown): FAQItem[] {
  if (!Array.isArray(x)) return [];
  const out: FAQItem[] = [];
  for (const item of x) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const q = o.question;
    const a = o.answer;
    if (typeof q === "string" && typeof a === "string") out.push({ question: q, answer: a });
  }
  return out;
}

/* ------------------------- SSG ------------------------- */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const guidesUnknown = (await getGuides()) as unknown;
  const guides = Array.isArray(guidesUnknown) ? (guidesUnknown as GuideLite[]) : [];
  return guides.map((g) => ({ slug: String(g.slug) }));
}

/* ------------------------- SEO (dynamic OG) ------------------------- */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const guide = (await getGuideBySlug(slug)) as unknown as GuideLite | null;

  if (!guide) {
    return {
      title: "Guide not found",
      robots: { index: false, follow: false },
    };
  }

  const title = String(guide.title ?? "Guide");
  const description =
    guide.description != null
      ? String(guide.description)
      : `Read our guide: ${title}. Practical tips, steps, and internal links.`;

  const canonicalPath = `/guides/${String(guide.slug)}`;
  const canonicalAbs = absoluteUrl(canonicalPath);

  const ogAbs = absoluteUrl(
    `/og?type=guide&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
      "Step-by-step casino guide"
    )}`
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
export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;

  const guide = (await getGuideBySlug(slug)) as unknown as GuideLite | null;
  if (!guide) notFound();

  const breadcrumbLd = buildBreadcrumbJsonLd(String(guide.title), String(guide.slug));

  // Optional internal linking
  const casinosUnknown = (await getCasinos()) as unknown;
  const countriesUnknown = (await getCountries()) as unknown;

  const casinos = Array.isArray(casinosUnknown) ? (casinosUnknown as CasinoLite[]) : [];
  const countries = Array.isArray(countriesUnknown) ? (countriesUnknown as CountryLite[]) : [];

  const relatedCasinoSlugs = toStringArray(guide.relatedCasinos).map((s) => s.toLowerCase());
  const relatedCountryCodes = toStringArray(guide.relatedCountries).map((c) => c.toUpperCase());

  const relatedCasinos = casinos.filter((c) =>
    relatedCasinoSlugs.includes(String(c.slug).toLowerCase())
  );
  const relatedCountries = countries.filter((c) =>
    relatedCountryCodes.includes(String(c.code).toUpperCase())
  );

  // Optional FAQ
  const faq = toFaqArray(guide.faq);
  const faqLd = faq.length > 0 ? buildFaqJsonLd(faq) : null;

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* FAQ schema (only if faq exists) */}
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

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
            <p className="badge">📘 Guide</p>

            <nav
              aria-label="Guide page links"
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
              <Link className="navlink" href="/guides">
                ← Back to guides
              </Link>
              <span className="kbd">faq</span>
              <span className="kbd">internal links</span>
            </nav>
          </div>

          <h1 className="h1" style={{ marginTop: 12 }}>
            {String(guide.title)}
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            {guide.description
              ? String(guide.description)
              : "A practical guide with clear steps, tips, and helpful internal links."}
          </p>
        </header>

        {/* CONTENT */}
        <section className="card" aria-labelledby="guide-content">
          <h2 className="h2" id="guide-content">
            Guide
          </h2>
          <div className="hr" />

          {guide.content ? (
            <div style={{ lineHeight: 1.65, color: "var(--text)" }}>{String(guide.content)}</div>
          ) : (
            <p className="p">
              Content is not provided yet. Add <span className="kbd">content</span> field to guides.json
              to show full guide text here.
            </p>
          )}
        </section>

        {/* RELATED CASINOS */}
        <section className="card" aria-labelledby="related-casinos">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2" id="related-casinos">
              Related casinos
            </h2>
            <Link href="/casinos" className="small">
              all casinos →
            </Link>
          </header>

          <p className="p">Casinos mentioned or recommended in this guide.</p>
          <div className="hr" />

          {relatedCasinos.length === 0 ? (
            <p className="p">No related casinos linked yet.</p>
          ) : (
            <ul className="grid grid-2" aria-label="Casinos list">
              {relatedCasinos.map((c) => {
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

        {/* RELATED COUNTRIES */}
        <section className="card" aria-labelledby="related-countries">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2" id="related-countries">
              Related countries
            </h2>
            <Link href="/countries" className="small">
              all countries →
            </Link>
          </header>

          <p className="p">Countries and regions covered by this guide.</p>
          <div className="hr" />

          {relatedCountries.length === 0 ? (
            <p className="p">No related countries linked yet.</p>
          ) : (
            <ul className="grid grid-2" aria-label="Countries list">
              {relatedCountries.map((c) => (
                <li key={String(c.code)} className="card" style={{ background: "var(--panel)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <Link href={`/countries/${String(c.code)}`}>{String(c.name)}</Link>
                    <span className="small">{String(c.code)}</span>
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

        {/* FAQ (visible) */}
        <section className="card" aria-labelledby="faq">
          <h2 className="h2" id="faq">
            FAQ
          </h2>
          <p className="p">Quick answers related to this guide.</p>
          <div className="hr" />

          {faq.length === 0 ? (
            <p className="p">
              No FAQ yet. Add <span className="kbd">faq</span> array to guides.json to show it here and
              enable FAQ schema.
            </p>
          ) : (
            <dl className="list" aria-label="FAQ list">
              {faq.map((qa) => (
                <div key={qa.question} className="card" style={{ background: "var(--panel)" }}>
                  <dt style={{ fontWeight: 800 }}>{qa.question}</dt>
                  <dd className="p" style={{ marginTop: 8 }}>
                    {qa.answer}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* NEXT LINKS */}
        <section className="card" aria-labelledby="explore-more">
          <h2 className="h2" id="explore-more">
            Explore more
          </h2>
          <p className="p">Use internal linking to grow topical authority and navigation depth.</p>
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
