// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gold-star-ten.vercel.app"
).replace(/\/$/, "");

const SITE_NAME = "Gold Star";
const DEFAULT_DESCRIPTION = "Gold Star — casino reviews, countries, and guides.";

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
    url: "/",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url:
          "/og?type=page&title=" +
          encodeURIComponent(SITE_NAME) +
          "&subtitle=" +
          encodeURIComponent("Casino reviews, countries, and guides"),
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
    images: [
      "/og?type=page&title=" +
        encodeURIComponent(SITE_NAME) +
        "&subtitle=" +
        encodeURIComponent("Casino reviews, countries, and guides"),
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <nav className="nav" aria-label="Primary">
            <Link href="/" className="brand" aria-label={`${SITE_NAME} home`}>
              <span className="brand-badge">⭐ {SITE_NAME}</span>
              <span className="small">Casino reviews</span>
            </Link>

            <ul className="navlinks">
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
          <div className="container" style={{ padding: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <small>
                © {new Date().getFullYear()} {SITE_NAME}
              </small>
              <small className="small">Trusted reviews & guides</small>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
