import casinosJson from "@/data/casinos.json";

export type Casino = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  minDeposit?: number;
  countries: string[];

  // опционально, если у тебя есть
  description?: string;
  pros?: string[];
  cons?: string[];
  faq?: { question: string; answer: string }[];
};

function toStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter((v): v is string => typeof v === "string");
}

function toFaqArray(x: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(x)) return [];
  return x
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const q = o.question;
      const a = o.answer;
      if (typeof q !== "string" || typeof a !== "string") return null;
      return { question: q, answer: a };
    })
    .filter((v): v is { question: string; answer: string } => v !== null);
}

function toCasino(x: unknown): Casino | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;

  const id = o.id;
  const slug = o.slug;
  const name = o.name;
  const rating = o.rating;

  if (typeof id !== "string") return null;
  if (typeof slug !== "string") return null;
  if (typeof name !== "string") return null;
  if (typeof rating !== "number") return null;

  const countries = toStringArray(o.countries);
  if (countries.length === 0) return null;

  const minDeposit = o.minDeposit;
  const description = o.description;

  return {
    id,
    slug,
    name,
    rating,
    countries,
    ...(typeof minDeposit === "number" ? { minDeposit } : {}),
    ...(typeof description === "string" ? { description } : {}),
    pros: toStringArray(o.pros),
    cons: toStringArray(o.cons),
    faq: toFaqArray(o.faq),
  };
}

export async function getCasinos(): Promise<Casino[]> {
  const raw = casinosJson as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map(toCasino).filter((c): c is Casino => c !== null);
}

export async function getCasinoBySlug(slug: string): Promise<Casino | null> {
  const normalized = slug.toLowerCase();
  const casinos = await getCasinos();
  return casinos.find((c) => c.slug.toLowerCase() === normalized) ?? null;
}

export async function getCasinosByCountryCode(code: string): Promise<Casino[]> {
  const normalized = code.toLowerCase();
  const casinos = await getCasinos();
  return casinos.filter((c) => c.countries.some((cc) => cc.toLowerCase() === normalized));
}
