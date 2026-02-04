// lib/site.ts
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ggoldstar.com"
).replace(/\/$/, "");

export const SITE_NAME = "Gold Star";

export const DEFAULT_DESCRIPTION =
  "Gold Star — casino reviews, countries, and guides.";

/**
 * Build absolute URL for a given path.
 * - Ensures leading slash for paths
 * - Preserves full URLs if passed accidentally
 */
export function absoluteUrl(path: string) {
  if (!path) return SITE_URL;

  // If already absolute (http/https), return as-is
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
