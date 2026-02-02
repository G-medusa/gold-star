// app/page.tsx
import Link from "next/link";

import { getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";
import { getGuides } from "@/lib/guides";

type CasinoLite = {
  slug: string;
  name: string;
  rating?: unknown;
};

type CountryLite = {
  code: string;
  name: string;
};

type GuideLite = {
  slug: string;
  title: string;
};

function topBy<T>(arr: T[], take: number) {
  return arr.slice(0, Math.max(0, take));
}

function ratingNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function HomePage() {
  const [casinosUnknown, countriesUnknown, guidesUnknown] = await Promise.all([
    getCasinos(),
    getCountries(),
    getGuides(),
  ]);

  const casinos = Array.isArray(casinosUnknown) ? (casinosUnknown as CasinoLite[]) : [];
  const countries = Array.isArray(countriesUnknown) ? (countriesUnknown as CountryLite[]) : [];
  const guides = Array.isArray(guidesUnknown) ? (guidesUnknown as GuideLite[]) : [];

  const topCasinos = topBy(
    [...casinos].sort((a, b) => ratingNumber(b.rating) - ratingNumber(a.rating)),
    6
  );

  const popularCountries = topBy([...countries], 8);
  const latestGuides = topBy([...guides], 6);

  return (
    <main className="grid" style={{ gap: 22 }}>
      {/* HERO / INTRO */}
      <section className="card" style={{ padding: 24 }}>
        <header className="grid" style={{ gap: 12, maxWidth: 900 }}>
          <span className="badge">⭐ Gold Star</span>

          <h1 className="h1">
            Casino reviews, country availability and practical gambling guides
          </h1>

          <p className="p">
            Gold Star is an editorial casino guide built to help players compare online casinos,
            understand regional availability, and make informed decisions. We focus on clear reviews,
            transparent criteria, and structured content — from casino brands and bonuses to payments,
            mobile experience, and country specific rules.
          </p>

          <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <Link className="navlink" href="/casinos">
              Browse casinos
            </Link>
            <Link className="navlink" href="/countries">
              Casinos by country
            </Link>
            <Link className="navlink" href="/guides">
              Read guides
            </Link>
          </nav>
        </header>
      </section>

      {/* CORE SECTIONS */}
      <section className="grid grid-2">
        <article className="card">
          <h2 className="h2">Casino Reviews</h2>
          <p className="p">
            Our casino reviews focus on practical details: bonuses and wagering terms, supported payment
            methods, withdrawal speed, mobile usability, and overall reliability. Each brand is reviewed
            using the same criteria to keep comparisons fair and transparent.
          </p>
          <div className="hr" />
          <Link href="/casinos">View all casino reviews →</Link>
        </article>

        <article className="card">
          <h2 className="h2">Casinos by Country</h2>
          <p className="p">
            Availability and rules differ by region. On our country pages you’ll find which casinos are
            accessible, what payment methods are commonly used, and what players should know before
            signing up in a specific location.
          </p>
          <div className="hr" />
          <Link href="/countries">Explore countries →</Link>
        </article>

        <article className="card">
          <h2 className="h2">Guides & How Tos</h2>
          <p className="p">
            Our guides explain common topics like bonuses, withdrawals, verification, and mobile play.
            They are written to answer real player questions and link back to relevant casinos and
            country pages where it makes sense.
          </p>
          <div className="hr" />
          <Link href="/guides">Read all guides →</Link>
        </article>

        <article className="card">
          <h2 className="h2">How we evaluate casinos</h2>
          <ul className="p">
            <li>Clarity of bonus terms and wagering requirements</li>
            <li>Supported payment methods and withdrawal speed</li>
            <li>Mobile experience and usability</li>
            <li>Verification requirements and limits</li>
            <li>General reputation and user feedback</li>
          </ul>
        </article>
      </section>

      {/* FEATURED CONTENT */}
      <section className="grid grid-2">
        <article className="card">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Top rated casinos</h2>
            <Link href="/casinos" className="small">
              all →
            </Link>
          </header>

          {topCasinos.length === 0 ? (
            <p className="p">Casino reviews will appear here soon.</p>
          ) : (
            <ul className="list" style={{ marginTop: 12 }}>
              {topCasinos.map((c) => (
                <li key={c.slug} className="item">
                  <Link href={`/casinos/${c.slug}`}>{c.name}</Link>
                  {ratingNumber(c.rating) > 0 && (
                    <span className="small">⭐ {ratingNumber(c.rating).toFixed(1)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Popular countries</h2>
            <Link href="/countries" className="small">
              all →
            </Link>
          </header>

          {popularCountries.length === 0 ? (
            <p className="p">Country pages will appear here soon.</p>
          ) : (
            <ul className="list" style={{ marginTop: 12 }}>
              {popularCountries.map((c) => (
                <li key={c.code} className="item">
                  <Link href={`/countries/${c.code}`}>{c.name}</Link>
                  <span className="small">{c.code}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Latest guides</h2>
            <Link href="/guides" className="small">
              all →
            </Link>
          </header>

          {latestGuides.length === 0 ? (
            <p className="p">Guides are being prepared.</p>
          ) : (
            <ul className="list" style={{ marginTop: 12 }}>
              {latestGuides.map((g) => (
                <li key={g.slug} className="item">
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  <span className="small">guide</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h2 className="h2">Responsible play</h2>
          <p className="p">
            Online gambling is a form of entertainment, not a guaranteed way to earn money. Always play
            responsibly, understand the rules of each casino, and seek help if gambling stops being fun.
          </p>
        </article>
      </section>
    </main>
  );
}
