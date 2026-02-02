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
    <main className="grid" style={{ gap: 24 }}>
      {/* HERO */}
      <section className="card" style={{ padding: 24 }}>
        <header className="grid" style={{ gap: 14, maxWidth: 960 }}>
          <span className="badge">⭐ Gold Star</span>

          <h1 className="h1" style={{ margin: 0 }}>
            Casino reviews, country availability and practical gambling guides
          </h1>

          <p className="p" style={{ margin: 0 }}>
            Gold Star is an editorial casino guide designed to help players navigate online casinos with
            clarity and realistic expectations. We publish structured casino reviews, country specific
            availability pages, and practical guides that explain how things actually work — from bonuses
            and payments to withdrawals, verification, and mobile play.
          </p>

          <p className="p">
            Instead of promotional language, we focus on practical details that affect real usage.
            If you are choosing a casino for a specific reason — faster withdrawals, mobile convenience,
            or availability in your country — the sections below are a good starting point.
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

      {/* STRUCTURE */}
      <section className="grid grid-2">
        <article className="card">
          <h2 className="h2">How this site is structured</h2>
          <p className="p">
            Gold Star is split into three main sections. The{" "}
            <Link href="/casinos">casino catalog</Link> contains brand reviews with a consistent layout,
            making it easier to compare casinos side by side. The{" "}
            <Link href="/countries">country section</Link> explains where casinos are available and what
            regional factors matter in practice. The{" "}
            <Link href="/guides">guides library</Link> answers common questions and links back to relevant
            casinos and countries.
          </p>
          <p className="p">
            This structure allows you to move from a general question to a specific answer without jumping
            between unrelated pages or marketing heavy lists.
          </p>
        </article>

        <article className="card">
          <h2 className="h2">How we evaluate casinos</h2>
          <ul className="p">
            <li>
              <b>Bonus clarity:</b> wagering requirements, restrictions, and how easy the terms are to verify
            </li>
            <li>
              <b>Payments:</b> supported methods, typical withdrawal times, and common limitations
            </li>
            <li>
              <b>Mobile experience:</b> usability on phones, performance, and feature availability
            </li>
            <li>
              <b>Account rules:</b> verification (KYC), limits, and support responsiveness
            </li>
            <li>
              <b>Reliability signals:</b> recurring user issues and reputation indicators when available
            </li>
          </ul>
          <p className="small">
            Ratings summarize the overall experience using the same checklist — they are not marketing scores.
          </p>
        </article>
      </section>

      {/* WHY CHOICE MATTERS */}
      <section className="card">
        <h2 className="h2">Why choosing the right casino actually matters</h2>
        <p className="p">
          Online casinos are not interchangeable. Some prioritize large bonuses with strict wagering
          requirements, others focus on simpler payments and faster withdrawals, while some are optimized
          mainly for mobile play. Choosing a casino that fits your preferences can significantly affect
          how smooth or frustrating the experience feels.
        </p>
        <p className="p">
          A casino that works well for casual slot play may be a poor choice if fast access to winnings
          is important. Likewise, a platform with a huge game catalog but confusing navigation may feel
          overwhelming, even if the bonuses look attractive. Our reviews are structured to help you answer
          a simple question first: does this casino fit how I want to play?
        </p>
      </section>

      {/* GAMES */}
      <section className="card">
        <h2 className="h2">Game variety and player preferences</h2>
        <p className="p">
          Game selection is another area where “best casino” means different things to different players.
          Some platforms focus heavily on slots with thousands of titles and varied volatility levels.
          Others emphasize table games or live dealer sections that aim to replicate a land based casino
          experience.
        </p>
        <p className="p">
          This variety matters because engagement depends on personal preference. A smaller but well curated
          selection can feel more enjoyable than a massive catalog with poor filtering. Our casino reviews
          highlight the type of games each platform leans toward, so you can quickly decide whether it aligns
          with what you actually enjoy playing.
        </p>
      </section>

      {/* FEATURED */}
      <section className="grid grid-2">
        <article className="card">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Top casinos
            </h2>
            <Link className="small" href="/casinos">
              all →
            </Link>
          </header>

          <p className="p">
            These casino reviews are a good entry point if you already have a brand in mind or want to see
            how different platforms compare using the same criteria.
          </p>

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
          <header style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Popular countries
            </h2>
            <Link className="small" href="/countries">
              all →
            </Link>
          </header>

          <p className="p">
            Country pages explain practical availability and regional nuances such as common payment
            methods, verification expectations, and typical bonus considerations.
          </p>

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
      </section>

      {/* GUIDES + RESPONSIBLE */}
      <section className="grid grid-2">
        <article className="card">
          <header style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h2 className="h2" style={{ margin: 0 }}>
              Latest guides
            </h2>
            <Link className="small" href="/guides">
              all →
            </Link>
          </header>

          <p className="p">
            Guides are written to answer practical questions players ask most often: how withdrawals work,
            what verification involves, how bonus wagering is calculated, and what to expect on mobile.
          </p>

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
            Online gambling should be treated as entertainment, not a guaranteed way to earn money.
            Always read the rules, understand bonus restrictions, and set personal limits. If gambling
            stops being fun, consider seeking help through local support services.
          </p>
        </article>
      </section>
    </main>
  );
}
