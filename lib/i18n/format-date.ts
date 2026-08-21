import type { Locale } from "./locales";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatBookDate(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  if (locale === "es") {
    return `${day}-${month}-${year}`;
  }
  return `${year}-${month}-${day}`;
}
