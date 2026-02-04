// app/sitemap.ts
import type { MetadataRoute } from "next";

import { getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";
import { getGuides } from "@/lib/guides";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [casinos, countries, guides] = await Promise.all([
    getCasinos(),
    getCountries(),
    getGuides(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now },
    { url: absoluteUrl("/casinos"), lastModified: now },
    { url: absoluteUrl("/countries"), lastModified: now },
    { url: absoluteUrl("/guides"), lastModified: now },
  ];

  const casinoRoutes: MetadataRoute.Sitemap = casinos.map((c) => ({
    url: absoluteUrl(`/casinos/${c.slug}`),
    lastModified: now,
  }));

  const countryRoutes: MetadataRoute.Sitemap = countries.map((c) => ({
    url: absoluteUrl(`/countries/${c.code}`),
    lastModified: now,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guides.map((g) => ({
    url: absoluteUrl(`/guides/${g.slug}`),
    lastModified: now,
  }));

  return [...staticRoutes, ...casinoRoutes, ...countryRoutes, ...guideRoutes];
}
