// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Gold Star",
    template: "%s | Gold Star",
  },
  description: "Gold Star — casino reviews, countries, and guides.",

  openGraph: {
    type: "website",
    siteName: "Gold Star",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Gold Star",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <div className="nav">
            <Link href="/" className="brand" aria-label="Gold Star home">
              <span className="brand-badge">⭐ Gold Star</span>
              <span className="small">Casino reviews</span>
            </Link>

            <nav className="navlinks" aria-label="Main navigation">
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
          </div>
        </header>

        <div className="container">
          <main className="main">{children}</main>
        </div>

        <footer className="footer">
          <div className="container" style={{ padding: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <small>© {new Date().getFullYear()} Gold Star</small>
              <small className="small">Trusted reviews & guides</small>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
