// app/casinos/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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
  minDeposit?: unknown;
  description?: unknown;
  countries?: unknown;

  pros?: unknown;
  cons?: unknown;
  faq?: unknown;

  overview?: unknown;
  payments?: unknown;
  bonuses?: unknown;
  mobile?: unknown;
  safety?: unknown;

  content?: unknown;
  internalLinks?: unknown;

  assets?: {
    hero?: string;
    ogImage?: string;
    screenshots?: {
      src: string;
      alt: string;
    }[];
  };
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

function asString(x: unknown): string | null {
  return typeof x === "string" && x.trim() ? x : null;
}

function asNumber(x: unknown): number | null {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : null;
}

function toStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.map((v) => String(v)).filter((s) => s.trim().length > 0);
}

function toFaqArray(x: unknown): Array<{ question: string; answer: string }> {
  if (!Array.isArray(x)) return [];
  const out: Array<{ question: string; answer: string }> = [];
  for (const item of x as unknown[]) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const q =
      typeof o.question === "string"
        ? o.question
        : typeof o.q === "string"
          ? o.q
          : null;
    const a =
      typeof o.answer === "string"
        ? o.answer
        : typeof o.a === "string"
          ? o.a
          : null;
    if (q && a) out.push({ question: q, answer: a });
  }
  return out;
}

function getNestedStringArray(obj: unknown, path: string[]): string[] {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== "object") return [];
    cur = (cur as Record<string, unknown>)[key];
  }
  return toStringArray(cur);
}

function asRecord(x: unknown): Record<string, unknown> | null {
  if (!x || typeof x !== "object") return null;
  return x as Record<string, unknown>;
}

function pick(obj: unknown, key: string): unknown {
  const r = asRecord(obj);
  return r ? r[key] : undefined;
}

function pick2(obj: unknown, k1: string, k2: string): unknown {
  return pick(pick(obj, k1), k2);
}

type ContentSection = { id: string; title: string; bullets: string[] };

function toContentSections(x: unknown): ContentSection[] {
  if (!x || typeof x !== "object") return [];
  const sections = (x as Record<string, unknown>).sections;
  if (!Array.isArray(sections)) return [];

  const out: ContentSection[] = [];
  for (const item of sections as unknown[]) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = asString(o.id) ?? "";
    const title = asString(o.title) ?? "";
    const bullets = toStringArray(o.bullets);
    if (!title || bullets.length === 0) continue;
    out.push({
      id: id || title.toLowerCase().replace(/\s+/g, "-"),
      title,
      bullets,
    });
  }
  return out;
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

function buildReviewJsonLd(
  casinoName: string,
  slug: string,
  rating: string | null,
  description: string
) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Organization",
      name: casinoName,
      url: `${SITE_URL}/casinos/${slug}`,
    },
    reviewBody: description,
  };

  if (rating) {
    base.reviewRating = {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return jsonLd(base);
}

function buildFaqJsonLd(faq: Array<{ question: string; answer: string }>) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer },
    })),
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

  // пробуем взять ogImage из assets
  const assets = casino.assets;
  const ogImageFromAssets =
    assets && typeof assets.ogImage === "string" ? assets.ogImage : null;

  // fallback на старый /og
  const ogPath =
    `/og?type=casino&title=${encodeURIComponent(title)}` +
    `&subtitle=${encodeURIComponent("Bonuses • Payments • Features")}` +
    (rating ? `&rating=${encodeURIComponent(rating)}` : "");

  const ogAbs = ogImageFromAssets
    ? ogImageFromAssets.startsWith("http")
      ? ogImageFromAssets
      : `${SITE_URL}${ogImageFromAssets}`
    : `${SITE_URL}${ogPath}`;

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

  // assets (строгое чтение)
  const assetsRec = asRecord(casino.assets);
  const assets = assetsRec
    ? {
        logo: typeof assetsRec.logo === "string" ? assetsRec.logo : null,
        hero: typeof assetsRec.hero === "string" ? assetsRec.hero : null,
        screenshots: Array.isArray(assetsRec.screenshots)
          ? (assetsRec.screenshots as unknown[])
              .map((s) => {
                if (!s || typeof s !== "object") return null;
                const so = s as Record<string, unknown>;
                const src = typeof so.src === "string" ? so.src : null;
                const alt = typeof so.alt === "string" ? so.alt : null;
                if (!src || !alt) return null;
                return { src, alt };
              })
              .filter((v): v is { src: string; alt: string } => v !== null)
          : [],
      }
    : { logo: null, hero: null, screenshots: [] as { src: string; alt: string }[] };

  const rating = formatRating(casino.rating);
  const minDeposit = asNumber(casino.minDeposit);

  const description =
    casino.description != null
      ? String(casino.description)
      : `A clear, structured review of ${casino.name}: key details, and links to guides and countries.`;

  const pros = toStringArray(casino.pros);
  const cons = toStringArray(casino.cons);
  const faq = toFaqArray(casino.faq);

  const whatToExpect = getNestedStringArray(casino.overview, ["whatToExpect"]);
  const whoItIsFor = getNestedStringArray(casino.overview, ["whoItIsFor"]);
  const whoItIsNotFor = getNestedStringArray(casino.overview, ["whoItIsNotFor"]);

  const paymentsFocus = asString(pick(casino.payments, "focus"));
  const paymentMethods = getNestedStringArray(casino.payments, ["methods"]);
  const withdrawalSpeed = asString(pick2(casino.payments, "withdrawals", "speed"));
  const withdrawalNotes = getNestedStringArray(casino.payments, ["withdrawals", "notes"]);
  const minDepositNotes = asString(pick(casino.payments, "minDepositNotes"));

  const bonusesSummary = asString(pick(casino.bonuses, "summary"));
  const bonusesChecks = getNestedStringArray(casino.bonuses, ["whatToCheck"]);

  const mobileExperience = asString(pick(casino.mobile, "experience"));
  const mobileNotes = getNestedStringArray(casino.mobile, ["notes"]);

  const license = asString(pick(casino.safety, "license"));
  const safetyNotes = getNestedStringArray(casino.safety, ["notes"]);

  const contentSections = toContentSections(casino.content);

  const internalGuideLinks = getNestedStringArray(casino.internalLinks, ["guides"]);
  const internalCountryLinks = getNestedStringArray(casino.internalLinks, ["countries"]);

  // Countries lookup
  const allCountriesUnknown = (await getCountries()) as unknown;
  const allCountries = Array.isArray(allCountriesUnknown)
    ? (allCountriesUnknown as CountryLite[])
    : [];

  const countryCodes: string[] = Array.isArray(casino.countries)
    ? (casino.countries as unknown[]).map((x) => String(x))
    : [];

  const availableCountries = allCountries.filter((c) =>
    countryCodes.includes(String(c.code))
  );

  // Related guides (from dataset)
  const relatedGuidesUnknown = (await getGuidesByCasinoSlug(String(casino.slug))) as unknown;
  const relatedGuides = Array.isArray(relatedGuidesUnknown)
    ? (relatedGuidesUnknown as GuideLite[])
    : [];

  // JSON-LD
  const breadcrumbLd = buildBreadcrumbJsonLd(String(casino.name), String(casino.slug));
  const reviewLd = buildReviewJsonLd(String(casino.name), String(casino.slug), rating, description);
  const faqLd = faq.length > 0 ? buildFaqJsonLd(faq) : null;

  const hasReviewSections =
    contentSections.length > 0 ||
    whatToExpect.length > 0 ||
    whoItIsFor.length > 0 ||
    whoItIsNotFor.length > 0 ||
    pros.length > 0 ||
    cons.length > 0 ||
    paymentMethods.length > 0 ||
    bonusesChecks.length > 0 ||
    mobileNotes.length > 0 ||
    safetyNotes.length > 0 ||
    faq.length > 0;

  const casinoName = String(casino.name);
  const casinoSlug = String(casino.slug);
  const canonicalUrl = `/casinos/${casinoSlug}`;

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Review */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }}
      />
      {/* FAQ schema (only if FAQ exists and is visible below) */}
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <article className="grid" style={{ gap: 18 }}>
        {/* HERO */}
        <header className="card" style={{ padding: 22 }}>
          {/* HERO IMAGE (from assets) */}
          {assets.hero ? (
            <figure style={{ marginBottom: 16 }}>
              <Image
                src={assets.hero}
                alt={`${casinoName} casino interface`}
                width={1600}
                height={900}
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                style={{ width: "100%", height: "auto", borderRadius: 12 }}
              />
              <figcaption className="small" style={{ marginTop: 6 }}>
                {casinoName} interface preview
              </figcaption>
            </figure>
          ) : null}

          <section
            aria-label="Page context"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <p className="badge">🎰 Casino Review</p>

            <nav
              aria-label="Casino page links"
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
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
          </section>

          <h1 className="h1" style={{ marginTop: 12 }}>
            {casinoName}
          </h1>

          <p className="p" style={{ maxWidth: 900 }}>
            {description}
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
                  {availableCountries.length > 0
                    ? `${availableCountries.length} countries`
                    : "Coming soon"}
                </dd>
                <dd className="small" style={{ marginTop: 6 }}>
                  Regional availability can vary by regulation.
                </dd>
              </div>

              {minDeposit != null ? (
                <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                  <dt className="small">Minimum deposit</dt>
                  <dd style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{`$${minDeposit}`}</dd>
                  <dd className="small" style={{ marginTop: 6 }}>
                    This can vary by payment method and region.
                  </dd>
                </div>
              ) : null}

              {paymentsFocus ? (
                <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                  <dt className="small">Payments focus</dt>
                  <dd style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>
                    {paymentsFocus}
                  </dd>
                  <dd className="small" style={{ marginTop: 6 }}>
                    Confirm available methods before depositing.
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </header>

        {/* SCREENSHOTS (from assets) */}
        {assets.screenshots.length > 0 ? (
          <section className="card" aria-labelledby="screenshots">
            <header>
              <h2 className="h2" id="screenshots">
                Screenshots
              </h2>
              <p className="p">Selected interface views for usability context.</p>
            </header>

            <div className="hr" />

            <ul
              className="grid grid-2"
              aria-label="Screenshots list"
              style={{ listStyle: "none", padding: 0 }}
            >
              {assets.screenshots.map((s) => (
                <li key={s.src}>
                  <figure>
                    <Image
                      src={s.src}
                      alt={s.alt}
                      width={1280}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 640px"
                      style={{ width: "100%", height: "auto", borderRadius: 12 }}
                    />
                    <figcaption className="small" style={{ marginTop: 6 }}>
                      {s.alt}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* REVIEW */}
        {hasReviewSections ? (
          <section className="card" aria-labelledby="review">
            <header>
              <h2 className="h2" id="review">
                Review
              </h2>
              <p className="p">
                Practical notes and expectations — focused on payments, usability, and the rules that affect
                real usage.
              </p>
            </header>

            <div className="hr" />

            {/* Editorial sections (preferred) */}
            {contentSections.length > 0 ? (
              <section aria-label="Editorial sections">
                {contentSections.map((s) => (
                  <section key={s.id} aria-labelledby={s.id} style={{ marginTop: 14 }}>
                    <h3 className="h2" id={s.id}>
                      {s.title}
                    </h3>
                    <ul className="p">
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </section>
            ) : null}

            {whatToExpect.length > 0 ? (
              <section aria-labelledby="what-to-expect" style={{ marginTop: 14 }}>
                <h3 className="h2" id="what-to-expect">
                  What to expect
                </h3>
                <ul className="p">
                  {whatToExpect.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {whoItIsFor.length > 0 || whoItIsNotFor.length > 0 ? (
              <section aria-label="Who it is for" style={{ marginTop: 14 }}>
                <dl className="grid grid-2">
                  {whoItIsFor.length > 0 ? (
                    <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                      <dt className="small">Who it’s for</dt>
                      <dd className="p" style={{ marginTop: 8 }}>
                        <ul className="p" style={{ margin: 0 }}>
                          {whoItIsFor.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}

                  {whoItIsNotFor.length > 0 ? (
                    <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                      <dt className="small">Who it’s not for</dt>
                      <dd className="p" style={{ marginTop: 8 }}>
                        <ul className="p" style={{ margin: 0 }}>
                          {whoItIsNotFor.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {pros.length > 0 || cons.length > 0 ? (
              <section aria-label="Pros and cons" style={{ marginTop: 14 }}>
                <dl className="grid grid-2">
                  {pros.length > 0 ? (
                    <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                      <dt className="small">Pros</dt>
                      <dd className="p" style={{ marginTop: 8 }}>
                        <ul className="p" style={{ margin: 0 }}>
                          {pros.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}

                  {cons.length > 0 ? (
                    <div className="card" style={{ padding: 14, background: "var(--panel)" }}>
                      <dt className="small">Cons</dt>
                      <dd className="p" style={{ marginTop: 8 }}>
                        <ul className="p" style={{ margin: 0 }}>
                          {cons.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {paymentMethods.length > 0 ||
            withdrawalSpeed ||
            withdrawalNotes.length > 0 ||
            minDepositNotes ? (
              <section aria-labelledby="payments" style={{ marginTop: 14 }}>
                <h3 className="h2" id="payments">
                  Payments and withdrawals
                </h3>

                {paymentMethods.length > 0 ? (
                  <>
                    <p className="p">Common payment directions listed in our dataset:</p>
                    <ul className="p">
                      {paymentMethods.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {withdrawalSpeed ? (
                  <p className="p">
                    <span className="kbd">Withdrawals:</span> {withdrawalSpeed}
                  </p>
                ) : null}

                {withdrawalNotes.length > 0 ? (
                  <ul className="p">
                    {withdrawalNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                ) : null}

                {minDepositNotes ? <p className="small">{minDepositNotes}</p> : null}
              </section>
            ) : null}

            {bonusesSummary || bonusesChecks.length > 0 ? (
              <section aria-labelledby="bonuses" style={{ marginTop: 14 }}>
                <h3 className="h2" id="bonuses">
                  Bonuses
                </h3>
                {bonusesSummary ? <p className="p">{bonusesSummary}</p> : null}
                {bonusesChecks.length > 0 ? (
                  <>
                    <p className="p">What to check before opting in:</p>
                    <ul className="p">
                      {bonusesChecks.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>
            ) : null}

            {mobileExperience || mobileNotes.length > 0 ? (
              <section aria-labelledby="mobile" style={{ marginTop: 14 }}>
                <h3 className="h2" id="mobile">
                  Mobile experience
                </h3>
                {mobileExperience ? (
                  <p className="p">
                    <span className="kbd">Overall:</span> {mobileExperience}
                  </p>
                ) : null}
                {mobileNotes.length > 0 ? (
                  <ul className="p">
                    {mobileNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            {license || safetyNotes.length > 0 ? (
              <section aria-labelledby="safety" style={{ marginTop: 14 }}>
                <h3 className="h2" id="safety">
                  Safety and expectations
                </h3>
                {license ? (
                  <p className="p">
                    <span className="kbd">License:</span> {license}
                  </p>
                ) : null}
                {safetyNotes.length > 0 ? (
                  <ul className="p">
                    {safetyNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            {faq.length > 0 ? (
              <section aria-labelledby="faq" style={{ marginTop: 14 }}>
                <h3 className="h2" id="faq">
                  FAQ
                </h3>
                <dl className="grid" style={{ gap: 10 }}>
                  {faq.map((qa) => (
                    <div
                      key={qa.question}
                      className="card"
                      style={{ padding: 14, background: "var(--panel)" }}
                    >
                      <dt style={{ fontWeight: 800 }}>{qa.question}</dt>
                      <dd className="p" style={{ marginTop: 8 }}>
                        {qa.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {internalGuideLinks.length > 0 || internalCountryLinks.length > 0 ? (
              <section aria-labelledby="internal-links" style={{ marginTop: 14 }}>
                <h3 className="h2" id="internal-links">
                  Internal links
                </h3>
                <p className="p">Editorial links to keep navigation consistent across the site.</p>

                {internalGuideLinks.length > 0 ? (
                  <>
                    <p className="small">Recommended guides</p>
                    <ul className="list" aria-label="Recommended guides list">
                      {internalGuideLinks.map((href) => (
                        <li key={href} className="item">
                          <Link href={href}>
                            {href.replace("/guides/", "").replace(/-/g, " ")}
                          </Link>
                          <span className="small">guide</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {internalCountryLinks.length > 0 ? (
                  <>
                    <p className="small" style={{ marginTop: 12 }}>
                      Related countries
                    </p>
                    <ul className="list" aria-label="Internal countries list">
                      {internalCountryLinks.map((href) => (
                        <li key={href} className="item">
                          <Link href={href}>{href.replace("/countries/", "")}</Link>
                          <span className="small">country</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>
            ) : null}
          </section>
        ) : null}

        {/* AVAILABLE IN */}
        <section className="card" aria-labelledby="available-in">
          <header>
            <h2 className="h2" id="available-in">
              Available in
            </h2>
            <p className="p">Countries where this casino is currently listed as available.</p>
          </header>

          <div className="hr" />

          {availableCountries.length === 0 ? (
            <p className="p">No countries linked yet for this casino.</p>
          ) : (
            <ul className="grid grid-2" aria-label="Countries list">
              {availableCountries.map((c) => (
                <li key={c.code} className="card" style={{ background: "var(--panel)" }}>
                  <section
                    aria-label={`${c.name} availability`}
                    style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
                  >
                    <Link href={`/countries/${c.code}`}>{c.name}</Link>
                    <span className="small">{c.code}</span>
                  </section>

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
          <header>
            <h2 className="h2" id="explore-more">
              Explore more
            </h2>
            <p className="p">
              Keep browsing the catalog — the fastest way to grow internal linking and topical authority.
            </p>
          </header>

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

          <p className="small" style={{ marginTop: 12 }}>
            Canonical: <Link href={canonicalUrl}>{canonicalUrl}</Link>
          </p>
        </section>
      </article>
    </>
  );
}
