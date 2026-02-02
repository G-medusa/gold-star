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
    <div className="grid" style={{ gap: 18 }}>
      {/* HERO */}
      <section className="card" style={{ padding: 22 }}>
        <div className="grid" style={{ gap: 10 }}>
          <div className="badge">⭐ Gold Star</div>

          <h1 className="h1">Casino reviews, countries & guides — clean and fast.</h1>

          <p className="p" style={{ maxWidth: 820 }}>
            We help players compare casinos, understand regional availability, and learn with practical
            guides. Built for speed, clarity, and SEO.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <Link className="navlink" href="/casinos">
              Browse casinos
            </Link>
            <Link className="navlink" href="/countries">
              Explore countries
            </Link>
            <Link className="navlink" href="/guides">
              Read guides
            </Link>

            <span className="kbd">SSG</span>
            <span className="kbd">Schema.org</span>
            <span className="kbd">OG images</span>
          </div>
        </div>
      </section>

      {/* 3 CARDS */}
      <section className="grid grid-2">
        <div className="card">
          <h2 className="h2">Casinos</h2>
          <p className="p">
            Reviews with ratings, features, and structured data (FAQ/Review/Breadcrumbs).
          </p>
          <div className="hr" />
          <Link href="/casinos">Go to казино-листинг →</Link>
        </div>

        <div className="card">
          <h2 className="h2">Countries</h2>
          <p className="p">
            Country pages show which casinos are available + guides for the region.
          </p>
          <div className="hr" />
          <Link href="/countries">Go to страны →</Link>
        </div>

        <div className="card">
          <h2 className="h2">Guides</h2>
          <p className="p">
            Educational content with FAQ schema + internal linking to casinos and countries.
          </p>
          <div className="hr" />
          <Link href="/guides">Go to guides →</Link>
        </div>

        <div className="card">
          <h2 className="h2">Built for SEO</h2>
          <p className="p">
            ItemList + BreadcrumbList, sitemap.xml, robots.txt, and dynamic OG images.
          </p>
          <div className="hr" />
          <p className="small">Next step: polishing detail pages and list cards.</p>
        </div>
      </section>

      {/* FEATURED */}
      <section className="grid grid-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Top Casinos</h2>
            <Link href="/casinos" className="small">
              all →
            </Link>
          </div>

          {topCasinos.length === 0 ? (
            <p className="p">No casinos yet.</p>
          ) : (
            <div className="list" style={{ marginTop: 10 }}>
              {topCasinos.map((c) => (
                <div key={c.slug} className="item">
                  <Link href={`/casinos/${c.slug}`}>{c.name}</Link>
                  <span className="small">
                    {ratingNumber(c.rating) > 0 ? `⭐ ${ratingNumber(c.rating).toFixed(1)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Popular Countries</h2>
            <Link href="/countries" className="small">
              all →
            </Link>
          </div>

          {popularCountries.length === 0 ? (
            <p className="p">No countries yet.</p>
          ) : (
            <div className="list" style={{ marginTop: 10 }}>
              {popularCountries.map((c) => (
                <div key={c.code} className="item">
                  <Link href={`/countries/${c.code}`}>{c.name}</Link>
                  <span className="small">{c.code}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h2 className="h2">Latest Guides</h2>
            <Link href="/guides" className="small">
              all →
            </Link>
          </div>

          {latestGuides.length === 0 ? (
            <p className="p">No guides yet.</p>
          ) : (
            <div className="list" style={{ marginTop: 10 }}>
              {latestGuides.map((g) => (
                <div key={g.slug} className="item">
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  <span className="small">guide</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="h2">Next on the roadmap</h2>
          <p className="p">
            We’ll polish list cards, add consistent hero sections on detail pages, and tighten internal
            linking across all sections.
          </p>
          <div className="hr" />
          <p className="small">
            Next file: <b>app/casinos/page.tsx</b> (cards + sorting + clean layout)
          </p>
        </div>
      </section>
    </div>
  );
}
