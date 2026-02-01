// lib/casinos.ts
import casinosData from "@/data/casinos.json";

export type Casino = {
  id: string;
  slug: string;
  name: string;
  rating?: number;
  countries: string[];       // <-- единое имя поля
  description?: string;      // <-- добавили под страницу/SEO
};

function normalizeCode(code: string) {
  return String(code ?? "").trim().toUpperCase();
}

function toCasino(raw: any): Casino {
  // поддержим обе схемы данных на всякий случай:
  // - countries: ["AU","CA"]
  // - countryCodes: ["AU","CA"] (старое/ошибочное)
  const countriesRaw = Array.isArray(raw?.countries)
    ? raw.countries
    : Array.isArray(raw?.countryCodes)
      ? raw.countryCodes
      : [];

  return {
    id: String(raw?.id ?? raw?.slug ?? crypto.randomUUID()),
    slug: String(raw?.slug ?? "").trim(),
    name: String(raw?.name ?? raw?.slug ?? "Casino").trim(),
    rating: typeof raw?.rating === "number" ? raw.rating : Number(raw?.rating) || undefined,
    countries: countriesRaw.map(normalizeCode).filter(Boolean),
    description: raw?.description ? String(raw.description) : undefined,
  };
}

export async function getCasinos(): Promise<Casino[]> {
  const arr = Array.isArray(casinosData) ? casinosData : [];
  return arr.map(toCasino).filter((c) => c.slug);
}

export async function getCasinoBySlug(slug: string): Promise<Casino | null> {
  const normalized = String(slug ?? "").trim().toLowerCase();
  const casinos = await getCasinos();
  return casinos.find((c) => c.slug.toLowerCase() === normalized) ?? null;
}
