import guidesJson from "@/data/guides.json";
import { getCasinos } from "@/lib/casinos";
import { getCountries } from "@/lib/countries";

export type GuideFAQ = { question: string; answer: string };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  content: string;
  faq?: GuideFAQ[];
  relatedCasinos?: string[];
  relatedCountries?: string[];
};

function toStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter((v): v is string => typeof v === "string");
}

function toFaqArray(x: unknown): GuideFAQ[] {
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
    .filter((v): v is GuideFAQ => v !== null);
}

function toGuide(x: unknown): Guide | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;

  const slug = o.slug;
  const title = o.title;
  const description = o.description;
  const content = o.content;

  if (typeof slug !== "string") return null;
  if (typeof title !== "string") return null;
  if (typeof description !== "string") return null;
  if (typeof content !== "string") return null;

  return {
    slug,
    title,
    description,
    content,
    faq: toFaqArray(o.faq),
    relatedCasinos: toStringArray(o.relatedCasinos),
    relatedCountries: toStringArray(o.relatedCountries),
  };
}

export async function getGuides(): Promise<Guide[]> {
  const raw = guidesJson as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map(toGuide).filter((g): g is Guide => g !== null);
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const normalized = slug.toLowerCase();
  const guides = await getGuides();
  return guides.find((g) => g.slug.toLowerCase() === normalized) ?? null;
}

/**
 * Возвращает гайды, связанные с конкретным казино (по slug).
 */
export async function getGuidesByCasinoSlug(casinoSlug: string): Promise<Guide[]> {
  const normalized = casinoSlug.toLowerCase();
  const guides = await getGuides();
  return guides.filter((g) => (g.relatedCasinos ?? []).some((s) => s.toLowerCase() === normalized));
}

/**
 * Возвращает гайды, связанные со страной (по коду).
 */
export async function getGuidesByCountryCode(code: string): Promise<Guide[]> {
  const normalized = code.toLowerCase();
  const guides = await getGuides();
  return guides.filter((g) =>
    (g.relatedCountries ?? []).some((c) => c.toLowerCase() === normalized)
  );
}

/**
 * Утилита: проверить ссылки (не обязательно, но удобно для контента).
 */
export async function validateGuideLinks() {
  const [guides, casinos, countries] = await Promise.all([getGuides(), getCasinos(), getCountries()]);
  const casinoSlugs = new Set(casinos.map((c) => c.slug.toLowerCase()));
  const countryCodes = new Set(countries.map((c) => c.code.toLowerCase()));

  return guides.map((g) => {
    const missingCasinos = (g.relatedCasinos ?? []).filter((s) => !casinoSlugs.has(s.toLowerCase()));
    const missingCountries = (g.relatedCountries ?? []).filter(
      (c) => !countryCodes.has(c.toLowerCase())
    );
    return { slug: g.slug, missingCasinos, missingCountries };
  });
}
