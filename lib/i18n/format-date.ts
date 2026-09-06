import type { Locale } from "./locales";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Format an ISO `YYYY-MM-DD` book date for display.
 *
 * - English locale: `YYYY-MM-DD` (ISO; same shape browsers expect on a
 *   `<input type="date">` value, so re-editing feels consistent).
 * - Spanish locale: `dd/mm/yyyy` with slashes, matching the locale-default
 *   the browser already renders for an `<input type="date">` so the visible
 *   dates are uniform across the form and the rest of the UI.
 */
export function formatBookDate(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  if (locale === "es") {
    return `${day}/${month}/${year}`;
  }
  return `${year}-${month}-${day}`;
}
