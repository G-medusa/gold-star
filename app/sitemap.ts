// app/sitemap.ts
import type { MetadataRoute } from "next";

import { getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";
import { getGuides } from "@/lib/guides";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [casinos, countries, guides] = await Promise.all([
    getCasinos(),
    getCountries(),
    getGuides(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now },
    { url: `${SITE_URL}/casinos`, lastModified: now },
    { url: `${SITE_URL}/countries`, lastModified: now },
    { url: `${SITE_URL}/guides`, lastModified: now },
  ];

  const casinoRoutes: MetadataRoute.Sitemap = casinos.map((c) => ({
    url: `${SITE_URL}/casinos/${c.slug}`,
    lastModified: now,
  }));

  const countryRoutes: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${SITE_URL}/countries/${c.code}`,
    lastModified: now,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...casinoRoutes, ...countryRoutes, ...guideRoutes];
}
