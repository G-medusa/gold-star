export type JsonLd = Record<string, unknown>;

/**
 * Helper для JSON-LD объектов:
 * - убирает any
 * - сохраняет автокомплит
 */
export function jsonLd<T extends JsonLd>(obj: T): T {
  return obj;
}
