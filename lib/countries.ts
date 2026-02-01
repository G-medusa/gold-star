// lib/countries.ts
import rawCountries from "@/data/countries.json";

export type Country = {
  code: string;
  name: string;
  description?: string;
};

function normalizeCountry(input: any): Country | null {
  // поддержим разные возможные ключи из json
  const code =
    typeof input?.code === "string"
      ? input.code
      : typeof input?.iso2 === "string"
        ? input.iso2
        : typeof input?.countryCode === "string"
          ? input.countryCode
          : null;

  const name =
    typeof input?.name === "string"
      ? input.name
      : typeof input?.title === "string"
        ? input.title
        : null;

  if (!code || !name) return null;

  const description = typeof input?.description === "string" ? input.description : undefined;

  return { code, name, description };
}

export async function getCountries(): Promise<Country[]> {
  const list = Array.isArray(rawCountries) ? rawCountries : [];
  const normalized = list.map(normalizeCountry).filter(Boolean) as Country[];

  // на всякий случай уберём дубликаты по code (частая проблема в json)
  const map = new Map<string, Country>();
  for (const c of normalized) {
    const key = c.code.toLowerCase();
    if (!map.has(key)) map.set(key, c);
  }
  return Array.from(map.values());
}

export async function getAllCountryCodes(): Promise<string[]> {
  const countries = await getCountries();
  return countries.map((c) => c.code);
}

export async function getCountryByCode(
  code: string | undefined | null
): Promise<Country | null> {
  if (!code) return null;
  const normalized = code.toLowerCase();

  const countries = await getCountries();
  return countries.find((c) => c.code.toLowerCase() === normalized) ?? null;
}
