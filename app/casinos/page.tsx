// app/casinos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { getCasinos } from "@/lib/casinos";
import { jsonLd } from "@/lib/schema";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Online Casino Reviews",
  description:
    "Browse online casino reviews with ratings, key features, and quick links to country availability and guides.",
  alternates: { canonical: absoluteUrl("/casinos") },
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
      { "@type": "ListItem", position: 2, name: "Casinos", item: absoluteUrl("/casinos") },
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
      url: absoluteUrl(`/casinos/${String(c.slug)}`),
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

      {/* Choosing a casino that fits you */}
      <section className="card">
        <h2 className="h2">How to choose a casino that fits you</h2>
        <p className="p">
          “Best casino” depends on what you value. Some players want the simplest withdrawals, others care
          most about mobile usability, and some focus on game variety or live dealer quality. Picking a casino
          that matches your habits usually matters more than chasing the biggest bonus headline.
        </p>
        <ul className="p">
          <li>
            <b>If you withdraw often:</b> prioritize withdrawal methods, typical processing times, and the
            verification flow.
          </li>
          <li>
            <b>If you play mostly on mobile:</b> prioritize speed, navigation, and whether key features are usable
            on a phone.
          </li>
          <li>
            <b>If you care about specific games:</b> check whether the catalog leans toward slots, table games,
            or live casino.
          </li>
          <li>
            <b>If you use a specific payment method:</b> shortlist casinos that support it reliably (and read any
            related limits).
          </li>
        </ul>
        <p className="small">
          Tip: If your first constraint is location, start with <Link href="/countries">casinos by country</Link>.
        </p>
      </section>

      {/* Game variety overview */}
      <section className="card">
        <h2 className="h2">Game variety: slots, table games and live casino</h2>
        <p className="p">
          Casinos differ in how they build their game selection. Slot heavy platforms often offer thousands of
          titles with different volatility levels and mechanics. Table game oriented casinos focus on blackjack,
          roulette, and poker variants. Live casino sections aim to replicate a real casino atmosphere with streamed
          dealers.
        </p>
        <p className="p">
          This matters because “more games” is not always better. A smaller but well organized catalog can feel more
          enjoyable than a huge library with weak filters and slow loading. In our reviews, we highlight what a casino
          leans toward so you can choose based on preference, not hype.
        </p>
      </section>

      {/* Practical checklist before signup */}
      <section className="card">
        <h2 className="h2">A quick checklist before you sign up</h2>
        <p className="p">
          Before registering, it helps to check a few practical details that often cause frustration later. This takes
          a minute and can save you from surprises during withdrawal.
        </p>
        <ul className="p">
          <li>
            <b>Bonus terms:</b> wagering requirements, excluded games, and whether the offer applies to your region.
          </li>
          <li>
            <b>Withdrawals:</b> typical processing time, minimum/maximum limits, and whether fees apply.
          </li>
          <li>
            <b>Verification (KYC):</b> prepare documents early if you want fewer payout delays.
          </li>
          <li>
            <b>Support:</b> check if live chat/email exists and whether response times are reasonable.
          </li>
        </ul>
        <p className="small">
          For deeper explanations, see <Link href="/guides">our guides</Link> (withdrawals, bonuses, and verification).
        </p>
      </section>

      {/* Payment methods and flexibility */}
      <section className="card">
        <h2 className="h2">Payment methods and flexibility</h2>
        <p className="p">
          Payment options are one of the most practical differences between casinos. While most platforms support
          basic methods like cards or e-wallets, the real experience depends on how flexible and transparent those
          options are in practice — especially when it comes to withdrawals.
        </p>
        <p className="p">
          Some casinos focus on traditional banking methods, others prioritize e-wallets or newer alternatives.
          For players, the important part is not just availability, but how smoothly deposits and payouts are
          processed, whether fees apply, and what limits exist for different methods.
        </p>
        <ul className="p">
          <li>
            <b>Consistency:</b> using the same method for deposits and withdrawals often reduces delays.
          </li>
          <li>
            <b>Withdrawal reality:</b> “instant” withdrawals usually apply after verification and within set limits.
          </li>
          <li>
            <b>Regional differences:</b> payment availability and processing times can vary significantly by country.
          </li>
        </ul>
        <p className="small">
          If payments are your main concern, combine casino reviews with{" "}
          <Link href="/countries">country pages</Link> to see what typically works best in your region.
        </p>
      </section>

      {/* Promotions and ongoing offers */}
      <section className="card">
        <h2 className="h2">Promotions, bonuses and player competitions</h2>
        <p className="p">
          Promotions are not limited to welcome bonuses. Many casinos offer ongoing incentives such as reload
          bonuses, free spins, cashback programs, loyalty rewards, or time limited competitions. These can add
          value, but only if the conditions match how you actually play.
        </p>
        <p className="p">
          Large headline bonuses often come with higher wagering requirements, while smaller recurring offers
          may be easier to use over time. Competitions and leaderboards can appeal to frequent players, but they
          usually reward volume rather than casual play.
        </p>
        <ul className="p">
          <li>
            <b>Welcome bonuses:</b> good for testing a casino, but always check wagering and exclusions.
          </li>
          <li>
            <b>Reload & cashback:</b> often more relevant for regular players than one time offers.
          </li>
          <li>
            <b>Tournaments & competitions:</b> can add excitement, but favor high activity levels.
          </li>
        </ul>
        <p className="small">
          In our reviews, promotions are explained in context — not as promises, but as optional extras with
          clear conditions.
        </p>
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
