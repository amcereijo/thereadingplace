import type { Locale } from "./locales";
import en from "./en.json";
import es from "./es.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

export function createT(dictionary: Dictionary): TFunction {
  return (key, params = {}) => {
    const count = typeof params.count === "number" ? params.count : undefined;
    const value = count !== undefined && count !== 1
      ? resolveKey(dictionary, `${key}_plural`) ?? resolveKey(dictionary, key)
      : resolveKey(dictionary, key);
    return interpolate(value ?? key, params);
  };
}

function resolveKey(dict: Dictionary, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(value: string, params: Record<string, string | number>): string {
  return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
