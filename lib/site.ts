// lib/site.ts
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gold-star-ten.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Gold Star";

export const DEFAULT_DESCRIPTION =
  "Gold Star — casino reviews, countries, and guides.";

export function absoluteUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE_URL}${path}`;
}
