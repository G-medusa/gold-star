// app/countries/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getCountries } from "@/lib/countries";
import { jsonLd } from "@/lib/schema";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gold-star-ten.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Online Casinos by Country",
  description:
    "Browse countries to see regional availability, practical notes about payments and verification, and links to relevant casino reviews and guides.",
  alternates: { canonical: `${SITE_URL}/countries` },
};

type CountryLite = {
  code: string;
  name: string;
  description?: unknown;
};

function buildBreadcrumbJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Countries", item: `${SITE_URL}/countries` },
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

function codeToFlagEmoji(code: string) {
  const cc = (code ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  const first = A + (cc.charCodeAt(0) - base);
  const second = A + (cc.charCodeAt(1) - base);
  return String.fromCodePoint(first, second);
}

export default async function CountriesPage() {
  const countriesUnknown = (await getCountries()) as unknown;
  const countries = Array.isArray(countriesUnknown) ? (countriesUnknown as CountryLite[]) : [];

  // Sort by name
  const sorted = [...countries].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""))
  );

  const breadcrumbLd = buildBreadcrumbJsonLd();

  // Keep JSON-LD reasonably sized
  const itemListLd = buildItemListJsonLd(
    sorted.slice(0, 200).map((c) => ({
      name: String(c.name ?? c.code ?? "Country"),
      url: `${SITE_URL}/countries/${String(c.code)}`,
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
        <header className="grid" style={{ gap: 12, maxWidth: 960 }}>
          <span className="badge">⭐ Gold Star</span>

          <h1 className="h1" style={{ margin: 0 }}>
            Online casinos by country
          </h1>

          <p className="p" style={{ margin: 0 }}>
            Casino availability is regional. A brand that works smoothly in one country may be restricted
            in another, or may require different payment methods and verification steps. This section helps
            you start from your location: open a country page to see practical availability notes, links to
            relevant casino reviews, and guides that answer common questions.
          </p>

          <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <Link className="navlink" href="/casinos">
              Casino reviews
            </Link>
            <Link className="navlink" href="/guides">
              Practical guides
            </Link>
          </nav>
        </header>
      </section>

      {/* Why countries matter */}
      <section className="grid grid-2">
        <article className="card">
          <h2 className="h2">Why country pages matter</h2>
          <p className="p">
            “Best casino” is rarely universal. In practice, players run into region specific differences:
            what payment methods are common, which operators accept local users, what type of verification
            is typical, and which restrictions apply. Country pages exist to reduce trial and error and help
            you choose a casino that actually fits your situation.
          </p>
          <p className="p">
            If you already have a casino brand in mind, you can start from the{" "}
            <Link href="/casinos">casino catalog</Link>. But if your first constraint is location — start
            here.
          </p>
        </article>

        <article className="card">
          <h2 className="h2">What you’ll find on each country page</h2>
          <ul className="p">
            <li>A curated list of casinos that are commonly available for the region</li>
            <li>Practical notes about payments (what users typically choose and why)</li>
            <li>Verification (KYC) expectations and common friction points</li>
            <li>Bonus context: what terms tend to matter most locally</li>
            <li>Links to guides that explain withdrawals, bonuses, and account rules</li>
          </ul>
          <p className="small">
            We keep the structure consistent so you can compare countries without learning a new layout each time.
          </p>
        </article>
      </section>

      {/* Practical notes */}
      <section className="card">
        <h2 className="h2">A practical way to use this section</h2>
        <p className="p">
          If your goal is to start playing with fewer surprises, don’t begin with bonuses. Start with
          availability and payments. A generous offer won’t help if the casino does not accept users in
          your region, or if withdrawals are complicated for your preferred payment method.
        </p>
        <p className="p">
          Once you open a country page, use it as a hub: pick one or two casinos that match your preferences
          (mobile experience, payment support, withdrawal expectations) and then read the relevant guide
          pages for details like wagering requirements or verification steps.
        </p>
        <ul className="p">
          <li>
            <b>Payments first:</b> choose a method you’re comfortable with, then shortlist casinos that support it
          </li>
          <li>
            <b>Verification awareness:</b> expect KYC before withdrawals and higher limits, especially on new accounts
          </li>
          <li>
            <b>Mobile reality:</b> if you primarily play on a phone, prioritize usability over catalog size
          </li>
        </ul>
      </section>
{/* Common pitfalls */}
<section className="card">
  <h2 className="h2">Common pitfalls when choosing a casino by country</h2>
  <p className="p">
    Country availability is not only about whether a website opens. In practice, players run into
    predictable issues: certain payment methods work poorly in a region, withdrawals require extra
    verification, or promotions have restrictions that are easy to miss when you sign up quickly.
  </p>
  <ul className="p">
    <li>
      <b>“Accessible” doesn’t always mean “fully supported”:</b> the casino may accept players, but some
      deposit/withdrawal methods may be limited or slower in the region.
    </li>
    <li>
      <b>Verification timing:</b> many platforms allow deposits instantly but request KYC before the first
      withdrawal, which can delay payouts if documents are not prepared.
    </li>
    <li>
      <b>Bonus restrictions:</b> some offers apply only to specific countries or payment methods, and the
      real wagering requirements may be higher than expected.
    </li>
    <li>
      <b>Mobile vs desktop differences:</b> in some regions, mobile is the primary way players access
      casinos, so usability matters more than catalog size.
    </li>
  </ul>
  <p className="small">
    The goal of our country pages is to highlight these practical constraints early — before they become
    a problem later.
  </p>
</section>

{/* Payments & withdrawals */}
<section className="card">
  <h2 className="h2">Payments, withdrawals and what “fast” really means</h2>
  <p className="p">
    “Fast withdrawals” is one of the most common claims in casino marketing, but the real speed depends
    on your region, payment method, and account status. A casino can process withdrawals quickly after
    verification, while first time payouts may take longer due to checks.
  </p>
  <p className="p">
    That’s why we treat payments as a first class topic on country pages. When you choose a country, you
    should be able to shortlist casinos that match how you actually deposit and withdraw — not just what
    looks good on a landing page.
  </p>
  <ul className="p">
    <li>
      <b>Pick a comfortable method first:</b> then choose casinos that support it reliably in your country.
    </li>
    <li>
      <b>Expect KYC:</b> prepare documents early if you want fewer delays when withdrawing.
    </li>
    <li>
      <b>Read limits and conditions:</b> minimum/maximum withdrawal rules and fees can matter more than the headline.
    </li>
  </ul>
</section>

{/* Mini FAQ */}
<section className="card">
  <h2 className="h2">Quick questions</h2>
  <h3 className="h2" style={{ marginTop: 10 }}>
    Can a casino be available in my country but still be a bad fit?
  </h3>
  <p className="p">
    Yes. Availability only means access. Fit depends on payments, withdrawal expectations, mobile usability,
    and whether the rules match how you plan to play.
  </p>

  <h3 className="h2" style={{ marginTop: 10 }}>
    Should I choose a casino based on the biggest bonus?
  </h3>
  <p className="p">
    Usually no. Start with payments and withdrawals, then evaluate bonuses. A large offer with strict wagering
    requirements can be worse than a smaller but clearer one.
  </p>

  <h3 className="h2" style={{ marginTop: 10 }}>
    Why do you link country pages to guides?
  </h3>
  <p className="p">
    Country pages give context; guides explain mechanics. For example, a country page may mention verification,
    while a guide explains what KYC typically involves and how to prepare.
  </p>
</section>

      {/* Country list */}
      {sorted.length === 0 ? (
        <section className="card">
          <h2 className="h2">Countries</h2>
          <p className="p">No countries yet.</p>
        </section>
      ) : (
        <section aria-label="Country list" className="grid grid-2">
          {sorted.map((c) => {
            const code = String(c.code ?? "");
            const name = String(c.name ?? "Country");
            const flag = codeToFlagEmoji(code);

            return (
              <article key={code || name} className="card">
                <header style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <h2 className="h2" style={{ margin: 0 }}>
                    <Link href={`/countries/${code}`}>
                      {flag ? `${flag} ` : ""}
                      {name}
                    </Link>
                  </h2>
                  <span className="small">{code}</span>
                </header>

                <p className="p" style={{ marginTop: 10 }}>
                  {c.description
                    ? String(c.description)
                    : `Open ${name} to see availability notes, relevant casino reviews, and guides for common questions.`}
                </p>

                <div className="hr" />

                <nav style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <Link href={`/countries/${code}`}>Open country page →</Link>
                  <span className="small">Region code: {code}</span>
                </nav>
              </article>
            );
          })}
        </section>
      )}

      {/* Responsible play */}
      <section className="card">
        <h2 className="h2">Responsible play</h2>
        <p className="p">
          Gambling should be treated as entertainment, not income. Read the rules, set personal limits, and
          avoid chasing losses. If gambling stops being fun, consider seeking help through local support
          services available in your country.
        </p>
      </section>
    </main>
  );
}
