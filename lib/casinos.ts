// lib/casinos.ts
import { promises as fs } from "fs";
import path from "path";

export type Casino = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  minDeposit?: number;
  countries: string[];

  description?: string;
  pros?: string[];
  cons?: string[];
  faq?: { question: string; answer: string }[];
  locale?: string; // на будущее
};

const CASINOS_DIR = path.join(process.cwd(), "data", "casinos");

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

  if (typeof o.slug !== "string") return null;
  if (typeof o.name !== "string") return null;
  if (typeof o.rating !== "number") return null;
  if (!Array.isArray(o.countries) || o.countries.length === 0) return null;

  return {
    id: typeof o.id === "string" ? o.id : o.slug,
    slug: o.slug,
    name: o.name,
    rating: o.rating,
    countries: toStringArray(o.countries),
    minDeposit: typeof o.minDeposit === "number" ? o.minDeposit : undefined,
    description: typeof o.description === "string" ? o.description : undefined,
    pros: toStringArray(o.pros),
    cons: toStringArray(o.cons),
    faq: toFaqArray(o.faq),
    locale: typeof o.locale === "string" ? o.locale : "en",
  };
}

async function readCasinoFile(file: string): Promise<Casino | null> {
  try {
    const raw = await fs.readFile(path.join(CASINOS_DIR, file), "utf-8");
    return toCasino(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getCasinos(): Promise<Casino[]> {
  try {
    const files = await fs.readdir(CASINOS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const casinos = await Promise.all(jsonFiles.map(readCasinoFile));
    return casinos.filter((c): c is Casino => c !== null);
  } catch {
    return [];
  }
}

export async function getCasinoBySlug(slug: string): Promise<Casino | null> {
  const file = `${slug.toLowerCase()}.json`;
  return readCasinoFile(file);
}

export async function getCasinosByCountryCode(code: string): Promise<Casino[]> {
  const normalized = code.toLowerCase();
  const casinos = await getCasinos();
  return casinos.filter((c) =>
    c.countries.some((cc) => cc.toLowerCase() === normalized)
  );
}
