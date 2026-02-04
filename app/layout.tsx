// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absoluteUrl } from "@/lib/site";

const OG_IMAGE = `/og?type=page&title=${encodeURIComponent(SITE_NAME)}&subtitle=${encodeURIComponent(
  "Casino reviews, countries, and guides"
)}`;

// ВАЖНО: фиксируем год как константу на этапе сборки,
// чтобы layout оставался статичным (без new Date() во время рендера).
const BUILD_YEAR = 2026;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: absoluteUrl("/"),
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <nav className="nav" aria-label="Основная навигация">
            <Link href="/" className="brand" aria-label={`${SITE_NAME} — на главную`}>
              <span className="brand-badge">⭐ {SITE_NAME}</span>
              <span className="small">Casino reviews</span>
            </Link>

            <ul className="navlinks" aria-label="Разделы сайта">
              <li>
                <Link className="navlink" href="/casinos">
                  Casinos
                </Link>
              </li>
              <li>
                <Link className="navlink" href="/countries">
                  Countries
                </Link>
              </li>
              <li>
                <Link className="navlink" href="/guides">
                  Guides
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main id="main-content" className="container">
          {children}
        </main>

        <footer className="footer">
          <section className="container" style={{ padding: 0 }} aria-label="Footer">
            <small>
              © {BUILD_YEAR} {SITE_NAME}
            </small>
            <small className="small">Trusted reviews &amp; guides</small>
          </section>
        </footer>
      </body>
    </html>
  );
}
