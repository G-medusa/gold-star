import countriesJson from "@/data/countries.json";

export type Country = {
  code: string;
  name: string;
  description?: string;
};

function toCountry(x: unknown): Country | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const code = o.code;
  const name = o.name;

  if (typeof code !== "string" || typeof name !== "string") return null;

  const description = o.description;
  return {
    code,
    name,
    ...(typeof description === "string" ? { description } : {}),
  };
}

export async function getCountries(): Promise<Country[]> {
  const raw = countriesJson as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map(toCountry).filter((c): c is Country => c !== null);
}

export async function getCountryByCode(code: string): Promise<Country | null> {
  const normalized = code.toLowerCase();
  const countries = await getCountries();
  return countries.find((c) => c.code.toLowerCase() === normalized) ?? null;
}
