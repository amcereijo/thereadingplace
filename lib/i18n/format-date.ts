import type { Locale } from "./locales";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Format an ISO `YYYY-MM-DD` book date for display.
 *
 * - English locale: `mm/dd/yyyy` with slashes — matches the `en-US` browser
 *   locale that <input type="date"> pickers default to, so the value shown
 *   in a card matches the value shown in the form input.
 * - Spanish locale: `dd/mm/yyyy` with slashes — matches the picker default
 *   for `es` browsers.
 *
 * The stored value remains ISO; only the rendered text is reformatted.
 */
export function formatBookDate(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  if (locale === "es") {
    return `${day}/${month}/${year}`;
  }
  return `${month}/${day}/${year}`;
}
