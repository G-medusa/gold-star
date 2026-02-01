// lib/guides.ts
import guidesData from "@/data/guides.json";

export type GuideFAQ = {
  question: string;
  answer: string;
};

export type Guide = {
  slug: string;
  title: string;
  description?: string;
  content?: string;

  relatedCasinos?: string[];
  relatedCountries?: string[];

  faq?: GuideFAQ[];
};

function toGuide(raw: any): Guide {
  return {
    slug: String(raw?.slug ?? "").trim(),
    title: String(raw?.title ?? raw?.slug ?? "Guide").trim(),
    description: raw?.description ? String(raw.description) : undefined,
    content: raw?.content ? String(raw.content) : undefined,

    relatedCasinos: Array.isArray(raw?.relatedCasinos)
      ? raw.relatedCasinos.map((x: any) => String(x).trim()).filter(Boolean)
      : [],

    relatedCountries: Array.isArray(raw?.relatedCountries)
      ? raw.relatedCountries.map((x: any) => String(x).trim().toUpperCase()).filter(Boolean)
      : [],

    faq: Array.isArray(raw?.faq)
      ? raw.faq
          .map((x: any) => ({
            question: String(x?.question ?? "").trim(),
            answer: String(x?.answer ?? "").trim(),
          }))
          .filter((x: GuideFAQ) => x.question && x.answer)
      : [],
  };
}

export async function getGuides(): Promise<Guide[]> {
  const arr = Array.isArray(guidesData) ? guidesData : [];
  return arr.map(toGuide).filter((g) => g.slug);
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const normalized = String(slug ?? "").trim().toLowerCase();
  const guides = await getGuides();
  return guides.find((g) => g.slug.toLowerCase() === normalized) ?? null;
}

export async function getGuidesByCasinoSlug(casinoSlug: string): Promise<Guide[]> {
  const target = String(casinoSlug ?? "").trim().toLowerCase();
  const guides = await getGuides();
  return guides.filter((g) =>
    (g.relatedCasinos ?? []).some((s) => String(s).toLowerCase() === target)
  );
}

export async function getGuidesByCountryCode(countryCode: string): Promise<Guide[]> {
  const target = String(countryCode ?? "").trim().toUpperCase();
  const guides = await getGuides();
  return guides.filter((g) =>
    (g.relatedCountries ?? []).some((c) => String(c).toUpperCase() === target)
  );
}
