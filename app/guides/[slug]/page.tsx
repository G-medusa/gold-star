// app/guides/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getGuides, getGuideBySlug } from "@/lib/guides";
import { getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

type PageProps = {
  params: Promise<{ slug: string }>;
};

function buildBreadcrumbJsonLd(title: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/guides/${slug}` },
    ],
  };
}

function buildFaqJsonLd(faq: Array<{ question: string; answer: string }>) {
  return {
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
  };
}

/* ------------------------- SSG ------------------------- */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const guides = await getGuides();
  return guides.map((g: any) => ({ slug: g.slug }));
}

/* ------------------------- SEO (dynamic OG) ------------------------- */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide not found",
      robots: { index: false, follow: false },
    };
  }

  const title = String(guide.title ?? "Guide");
  const description =
    guide.description?.toString() ||
    `Read our guide: ${title}. Practical tips, steps, and internal links.`;
  const url = `/guides/${guide.slug}`;

  const og = `/og?type=guide&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
    "Step-by-step casino guide"
  )}`;

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
export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;

  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const breadcrumbLd = buildBreadcrumbJsonLd(String(guide.title), String(guide.slug));

  // Optional internal linking (if your guide has arrays like relatedCasinos/relatedCountries)
  const casinos = await getCasinos();
  const countries = await getCountries();

  const relatedCasinoSlugs: string[] = Array.isArray((guide as any).relatedCasinos)
    ? (guide as any).relatedCasinos
    : [];

  const relatedCountryCodes: string[] = Array.isArray((guide as any).relatedCountries)
    ? (guide as any).relatedCountries
    : [];

  const relatedCasinos = casinos.filter((c: any) => relatedCasinoSlugs.includes(c.slug));
  const relatedCountries = countries.filter((c: any) => relatedCountryCodes.includes(c.code));

  // Optional FAQ schema if your data includes it
  const faq: Array<{ question: string; answer: string }> = Array.isArray((guide as any).faq)
    ? (guide as any).faq
    : [];

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

      <div className="grid" style={{ gap: 18 }}>
        {/* HERO */}
        <section className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div className="badge">📘 Guide</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="navlink" href="/guides">
                ← Back to guides
              </Link>
              <span className="kbd">faq</span>
              <span className="kbd">internal links</span>
            </div>
          </div>

          <h1 className="h1" style={{ marginTop: 12 }}>
            {guide.title}
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            {guide.description
              ? String(guide.description)
              : "A practical guide with clear steps, tips, and helpful internal links."}
          </p>
        </section>

        {/* CONTENT */}
        <section className="card">
          <h2 className="h2">Guide</h2>
          <div className="hr" />

          {/* If you store content as string/markdown, we can later render markdown properly.
              For now: safe text output. */}
          {(guide as any).content ? (
            <div style={{ lineHeight: 1.65, color: "var(--text)" }}>
              {String((guide as any).content)}
            </div>
          ) : (
            <p className="p">
              Content is not provided yet. Add <span className="kbd">content</span> field to guides.json
              to show full guide text here.
            </p>
          )}
        </section>

        {/* RELATED CASINOS */}
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Related casinos</h2>
            <Link href="/casinos" className="small">
              all casinos →
            </Link>
          </div>
          <p className="p">Casinos mentioned or recommended in this guide.</p>
          <div className="hr" />

          {relatedCasinos.length === 0 ? (
            <p className="p">No related casinos linked yet.</p>
          ) : (
            <div className="grid grid-2">
              {relatedCasinos.map((c: any) => (
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

        {/* RELATED COUNTRIES */}
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Related countries</h2>
            <Link href="/countries" className="small">
              all countries →
            </Link>
          </div>
          <p className="p">Countries and regions covered by this guide.</p>
          <div className="hr" />

          {relatedCountries.length === 0 ? (
            <p className="p">No related countries linked yet.</p>
          ) : (
            <div className="grid grid-2">
              {relatedCountries.map((c: any) => (
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

        {/* FAQ (visible) */}
        <section className="card">
          <h2 className="h2">FAQ</h2>
          <p className="p">Quick answers related to this guide.</p>
          <div className="hr" />

          {faq.length === 0 ? (
            <p className="p">
              No FAQ yet. Add <span className="kbd">faq</span> array to guides.json to show it here and
              enable FAQ schema.
            </p>
          ) : (
            <div className="list">
              {faq.map((qa, idx) => (
                <div key={idx} className="card" style={{ background: "var(--panel)" }}>
                  <div style={{ fontWeight: 800 }}>{qa.question}</div>
                  <p className="p" style={{ marginTop: 8 }}>
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NEXT LINKS */}
        <section className="card">
          <h2 className="h2">Explore more</h2>
          <p className="p">Use internal linking to grow topical authority and navigation depth.</p>
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
