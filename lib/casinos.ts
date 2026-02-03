// lib/casinos.ts
import { promises as fs } from "fs";
import path from "path";

/* =========================
   Assets types
========================= */

export type CasinoScreenshot = {
  src: string;
  alt: string;
};

export type CasinoAssets = {
  logo: string;
  hero: string;
  ogImage?: string;
  screenshots?: CasinoScreenshot[];
};

/* =========================
   Casino type
========================= */

export type Casino = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  minDeposit?: number;
  countries: string[];

  assets: CasinoAssets; // ⬅️ ОБЯЗАТЕЛЬНО

  description?: string;
  pros?: string[];
  cons?: string[];
  faq?: { question: string; answer: string }[];

  locale?: string; // на будущее

  // расширенные поля (храним как unknown, парсим/рендерим безопасно на странице)
  overview?: unknown;
  payments?: unknown;
  bonuses?: unknown;
  mobile?: unknown;
  safety?: unknown;
  content?: unknown;
  internalLinks?: unknown;

  markets?: unknown;
  timestamps?: unknown;
};

const CASINOS_DIR = path.join(process.cwd(), "data", "casinos");

/* =========================
   Helpers
========================= */

function toStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

function toFaqArray(x: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(x)) return [];
  return x
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;

      const q =
        typeof o.question === "string"
          ? o.question
          : typeof o.q === "string"
          ? o.q
          : null;

      const a =
        typeof o.answer === "string"
          ? o.answer
          : typeof o.a === "string"
          ? o.a
          : null;

      if (!q || !a) return null;
      return { question: q, answer: a };
    })
    .filter((v): v is { question: string; answer: string } => v !== null);
}

function toAssets(x: unknown): CasinoAssets | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;

  if (typeof o.logo !== "string") return null;
  if (typeof o.hero !== "string") return null;

  const screenshots =
    Array.isArray(o.screenshots)
      ? o.screenshots
          .map((s) => {
            if (!s || typeof s !== "object") return null;
            const so = s as Record<string, unknown>;
            if (typeof so.src !== "string" || typeof so.alt !== "string") return null;
            return { src: so.src, alt: so.alt };
          })
          .filter((v): v is CasinoScreenshot => v !== null)
      : undefined;

  return {
    logo: o.logo,
    hero: o.hero,
    ogImage: typeof o.ogImage === "string" ? o.ogImage : undefined,
    screenshots,
  };
}

/* =========================
   Parser
========================= */

function toCasino(x: unknown): Casino | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;

  if (typeof o.slug !== "string") return null;
  if (typeof o.name !== "string") return null;
  if (typeof o.rating !== "number") return null;
  if (!Array.isArray(o.countries) || o.countries.length === 0) return null;

  const assets = toAssets(o.assets);
  if (!assets) return null;

  return {
    id: typeof o.id === "string" ? o.id : o.slug,
    slug: o.slug,
    name: o.name,
    rating: o.rating,
    countries: toStringArray(o.countries),

    assets,

    minDeposit: typeof o.minDeposit === "number" ? o.minDeposit : undefined,
    description: typeof o.description === "string" ? o.description : undefined,

    pros: toStringArray(o.pros),
    cons: toStringArray(o.cons),
    faq: toFaqArray(o.faq),

    locale: typeof o.locale === "string" ? o.locale : "en",

    overview: o.overview,
    payments: o.payments,
    bonuses: o.bonuses,
    mobile: o.mobile,
    safety: o.safety,
    content: o.content,
    internalLinks: o.internalLinks,
    markets: o.markets,
    timestamps: o.timestamps,
  };
}

/* =========================
   FS layer
========================= */

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
    const jsonFiles = files
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

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
