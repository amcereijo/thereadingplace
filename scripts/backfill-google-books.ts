/**
 * scripts/backfill-google-books.ts
 *
 * One-shot script: walk every `books` row whose `metadata_json` is missing
 * at least one of the fields we collect from Google Books (cover URL, ISBN,
 * page count) and try to fill the gap. Idempotent — re-running is safe and
 * never overwrites an existing value.
 *
 * Filling order, per book:
 *   1. If a local ISBN is already present (any of `isbn`, `isbn13`, `isbn10`),
 *      try Google Books by ISBN first via `q=isbn:<value>`. The first matching
 *      volume is used to fill anything that's still missing locally.
 *   2. Otherwise (or when the ISBN lookup returns nothing), fall back to a
 *      title-based search with the same author-weighted ordering that the old
 *      metadata script used.
 *   3. From whichever search path returned a volume, fill the still-missing
 *      fields: `coverUrl`, `isbn10` / `isbn13` / `isbn`, `pageCount`.
 *
 * Books that already have all three pieces of metadata are skipped entirely
 * (no API call, no DB write).
 *
 * Title cleaning for the Google Books query:
 *   - Strips Amazon-style edition suffixes handled by `cleanBookQuery`
 *     ("(Spanish Edition)", "(Edición española)", "(Kindle Edition)", etc).
 *   - Additionally strips a "main title : subtitle" pattern down to the main
 *     title (e.g. "Atomic Habits: An Easy & Proven Way to Build Good Habits &
 *     Break Bad Ones" -> "Atomic Habits").
 *   - Then truncates to 80 chars via `cleanBookQuery`.
 *
 * Usage:
 *   GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-google-books.ts
 *   GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-google-books.ts --delay-ms 1500
 *
 * Notes:
 *   - Same rate-limit / retry behavior as the previous covers / metadata
 *     scripts.
 *   - Runs sequentially. At most one Google Books request per book.
 *   - Only touches `metadata_json` and `updated_at` on `books`.
 *   - For local development, load `.env.local` first to avoid passing env
 *     vars on every command:
 *       set -a; source .env.local; set +a
 *       npm run db:backfill-google-books
 */

import { eq } from "drizzle-orm";
import {
  GoogleBooksError,
  cleanBookQuery,
  searchByIsbn,
  searchVolumes,
  type NormalizedVolume,
} from "../lib/google-books";
import { db } from "../lib/db";
import { books } from "../lib/db/schema";
import type { Locale } from "../lib/i18n/locales";

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  metadataJson: string;
};

type CliOptions = {
  delayMs: number;
  maxRetries: number;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { delayMs: 1100, maxRetries: 3 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--delay-ms") {
      const value = Number(argv[++i]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`--delay-ms must be a non-negative number, got ${argv[i]}`);
      }
      opts.delayMs = value;
    } else if (arg === "--max-retries") {
      const value = Number(argv[++i]);
      if (!Number.isInteger(value) || value < 0) {
        throw new Error(`--max-retries must be a non-negative number, got ${argv[i]}`);
      }
      opts.maxRetries = value;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-google-books.ts [--delay-ms <ms>] [--max-retries <n>]",
      );
      process.exit(0);
    }
  }
  return opts;
}

function parseMetadata(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function hasCoverUrl(metadata: Record<string, unknown>): boolean {
  const raw = metadata.coverUrl;
  return typeof raw === "string" && raw.trim().length > 0;
}

function hasIsbn(metadata: Record<string, unknown>): boolean {
  const raw = metadata.isbn ?? metadata.isbn13 ?? metadata.isbn10;
  return typeof raw === "string" && raw.trim().length > 0;
}

function hasPageCount(metadata: Record<string, unknown>): boolean {
  return typeof metadata.pageCount === "number" && Number.isFinite(metadata.pageCount);
}

function extractLocalIsbn(metadata: Record<string, unknown>): string | null {
  const isbn13 = asString(metadata.isbn13);
  if (isbn13) return isbn13;
  const isbn10 = asString(metadata.isbn10);
  if (isbn10) return isbn10;
  return asString(metadata.isbn);
}

function isValidIsbn10(value: string): boolean {
  if (!/^\d{9}[\dX]$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (i + 1) * Number(value[i]);
  const check = value[9] === "X" ? 10 : Number(value[9]);
  sum += 10 * check;
  return sum % 11 === 0;
}

function isValidIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = Number(value[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return sum % 10 === 0;
}

function applyIsbn(metadata: Record<string, unknown>, isbn: string): void {
  const trimmed = isbn.trim();
  if (!trimmed) return;
  metadata.isbn = trimmed;
  if (isValidIsbn13(trimmed)) metadata.isbn13 = trimmed;
  else if (isValidIsbn10(trimmed)) metadata.isbn10 = trimmed;
}

function pickCover(volume: NormalizedVolume): string | null {
  return volume.imageLinks?.thumbnail ?? volume.imageLinks?.smallThumbnail ?? null;
}

function pickIsbn(volume: NormalizedVolume): string | null {
  for (const identifier of volume.industryIdentifiers) {
    if (identifier.type === "ISBN_13" && identifier.identifier.trim().length > 0) {
      return identifier.identifier.trim();
    }
  }
  for (const identifier of volume.industryIdentifiers) {
    if (identifier.type === "ISBN_10" && identifier.identifier.trim().length > 0) {
      return identifier.identifier.trim();
    }
  }
  return null;
}

function pickPageCount(volume: NormalizedVolume): number | null {
  return typeof volume.pageCount === "number" && Number.isFinite(volume.pageCount)
    ? volume.pageCount
    : null;
}

function orderByAuthor<T extends { authors: string[] }>(
  results: T[],
  expectedAuthor: string | null,
): T[] {
  const needle = normalizeAuthor(expectedAuthor);
  if (!needle) return results;
  const head: T[] = [];
  const tail: T[] = [];
  for (const volume of results) {
    if (matchesAuthor(volume.authors, needle)) {
      head.push(volume);
    } else {
      tail.push(volume);
    }
  }
  return head.concat(tail);
}

function normalizeAuthor(author: string | null): string {
  if (!author) return "";
  return author
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function matchesAuthor(authors: string[], needle: string): boolean {
  const normalizedNeedle = normalizeAuthor(needle);
  if (!normalizedNeedle) return false;
  for (const candidate of authors) {
    const normalized = normalizeAuthor(candidate);
    if (!normalized) continue;
    if (normalized === normalizedNeedle) return true;
    if (normalized.startsWith(normalizedNeedle)) return true;
    if (normalizedNeedle.startsWith(normalized)) return true;
  }
  return false;
}

/**
 * Strip Amazon-style edition suffixes that `cleanBookQuery` already handles,
 * plus a few locale variants, then reduce "Title: subtitle" to just "Title".
 */
export function shortTitleForQuery(input: string): string {
  let cleaned = cleanBookQuery(input);
  const colonMatch = cleaned.match(/^([^:–—-]{2,80}?)\s*[:–—\-]\s+/);
  if (colonMatch) {
    cleaned = colonMatch[1].trim();
  }
  return cleaned;
}

function detectLocale(book: BookRow): Locale {
  if (/[áéíóúñ¿¡]/i.test(book.title)) return "es";
  if (book.author && /[áéíóúñ¿¡]/i.test(book.author)) return "es";
  return "en";
}

async function loadMissingBooks(): Promise<BookRow[]> {
  const rows = await db.select().from(books);
  return rows
    .filter((row) => {
      const metadata = parseMetadata(row.metadataJson);
      return !hasCoverUrl(metadata) || !hasIsbn(metadata) || !hasPageCount(metadata);
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      metadataJson: row.metadataJson,
    }));
}

async function writeMetadata(id: string, metadata: Record<string, unknown>): Promise<void> {
  await db
    .update(books)
    .set({ metadataJson: JSON.stringify(metadata), updatedAt: new Date().toISOString() })
    .where(eq(books.id, id));
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SearchRunner = (locale: Locale) => Promise<NormalizedVolume[]>;

async function searchWithRetry(
  locale: Locale,
  opts: CliOptions,
  runner: SearchRunner,
): Promise<NormalizedVolume[]> {
  let attempt = 0;
  let backoff = 2000;
  while (true) {
    try {
      return await runner(locale);
    } catch (error) {
      const status = error instanceof GoogleBooksError ? error.status : undefined;
      const message = error instanceof Error ? error.message : String(error);
      const isQuotaError = isDailyQuotaMessage(message);
      if (!isQuotaError) {
        throw error;
      }
      if (attempt >= opts.maxRetries) {
        throw error;
      }
      console.warn(`  quota exhausted (status ${status}); retrying in ${backoff}ms`);
      await sleep(backoff);
      backoff *= 2;
      attempt++;
    }
  }
}

function isDailyQuotaMessage(message: string): boolean {
  return /queries per day|quota exceeded/i.test(message);
}

type Source = "isbn" | "title";

async function fetchVolume(
  book: BookRow,
  localIsbn: string | null,
  opts: CliOptions,
): Promise<{ volume: NormalizedVolume | null; source: Source | null; apiCalls: number }> {
  const locale = detectLocale(book);
  let apiCalls = 0;

  if (localIsbn) {
    apiCalls++;
    console.log(`  [concept: isbn] querying Google Books by ISBN ${localIsbn} (locale=${locale})`);
    const results = await searchWithRetry(locale, opts, async (l) => {
      const r = await searchByIsbn(localIsbn, l);
      return r.results;
    });
    const ordered = orderByAuthor(results, book.author);
    if (ordered.length > 0) {
      console.log(`  [concept: isbn] matched ${ordered.length} volume(s); using first`);
      return { volume: ordered[0], source: "isbn", apiCalls };
    }
    console.log(`  [concept: isbn] no match; falling back to title search`);
  }

  apiCalls++;
  const query = shortTitleForQuery(book.title);
  console.log(`  [concept: title] querying Google Books by title "${query}" (locale=${locale})`);
  const results = await searchWithRetry(locale, opts, async (l) => {
    const r = await searchVolumes(query, l);
    return r.results;
  });
  const ordered = orderByAuthor(results, book.author);
  if (ordered.length > 0) {
    console.log(`  [concept: title] matched ${ordered.length} volume(s); using first`);
    return { volume: ordered[0], source: "title", apiCalls };
  }
  console.log(`  [concept: title] no match`);

  return { volume: null, source: null, apiCalls };
}

type PatchResult = {
  cover: boolean;
  isbn: boolean;
  pageCount: boolean;
};

function applyMissingFields(
  metadata: Record<string, unknown>,
  volume: NormalizedVolume,
): PatchResult {
  const result: PatchResult = { cover: false, isbn: false, pageCount: false };

  if (!hasCoverUrl(metadata)) {
    const coverUrl = pickCover(volume);
    if (coverUrl) {
      metadata.coverUrl = coverUrl;
      result.cover = true;
    }
  }

  if (!hasIsbn(metadata)) {
    const isbn = pickIsbn(volume);
    if (isbn) {
      applyIsbn(metadata, isbn);
      result.isbn = true;
    }
  }

  if (!hasPageCount(metadata)) {
    const pageCount = pickPageCount(volume);
    if (pageCount !== null) {
      metadata.pageCount = pageCount;
      result.pageCount = true;
    }
  }

  return result;
}

async function main() {
  if (!process.env.GOOGLE_BOOKS_API_KEY) {
    throw new Error("GOOGLE_BOOKS_API_KEY is not configured");
  }

  const opts = parseArgs(process.argv.slice(2));
  const candidates = await loadMissingBooks();
  console.log(
    `backfill-google-books: ${candidates.length} book(s) missing cover/isbn/pageCount (delay=${opts.delayMs}ms, maxRetries=${opts.maxRetries})`,
  );

  let coversFilled = 0;
  let isbnsFilled = 0;
  let pageCountsFilled = 0;
  let isbnsFromLocal = 0;
  let isbnsFromApi = 0;
  let volumesByIsbn = 0;
  let volumesByTitle = 0;
  let notFound = 0;
  let errors = 0;
  let apiCalls = 0;

  for (let i = 0; i < candidates.length; i++) {
    const book = candidates[i];
    const metadata = parseMetadata(book.metadataJson);
    const needsIsbn = !hasIsbn(metadata);

    const localIsbn = needsIsbn ? extractLocalIsbn(metadata) : null;
    if (needsIsbn && localIsbn) {
      applyIsbn(metadata, localIsbn);
      isbnsFilled++;
      isbnsFromLocal++;
      await writeMetadata(book.id, metadata);
      console.log(`  + isbn (local): "${book.title}" -> ${localIsbn}`);
    }

    const stillMissing = !hasCoverUrl(metadata) || !hasIsbn(metadata) || !hasPageCount(metadata);
    if (!stillMissing) continue;

    let didApiCall = false;
    try {
      const { volume, source, apiCalls: calls } = await fetchVolume(book, localIsbn, opts);
      apiCalls += calls;
      didApiCall = calls > 0;

      if (volume === null) {
        notFound++;
        console.log(`  no volume: "${book.title}"`);
      } else {
        if (source === "isbn") volumesByIsbn++;
        if (source === "title") volumesByTitle++;

        const before = JSON.stringify(metadata);
        const applied = applyMissingFields(metadata, volume);
        const dirty = JSON.stringify(metadata) !== before;
        if (dirty) await writeMetadata(book.id, metadata);

        if (applied.cover) coversFilled++;
        if (applied.isbn) {
          isbnsFilled++;
          isbnsFromApi++;
        }
        if (applied.pageCount) pageCountsFilled++;

        const tags = [
          applied.cover ? `cover (api/${source})` : null,
          applied.isbn ? `isbn (api/${source})` : null,
          applied.pageCount ? `pageCount (api/${source})` : null,
        ].filter(Boolean);

        if (tags.length > 0) {
          console.log(`  + ${tags.join(", ")}: "${book.title}"`);
        } else {
          console.log(`  no new fields (already had all from ${source}): "${book.title}"`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isDailyQuotaMessage(message)) {
        console.error(
          `\nbackfill-google-books: Google Books daily quota exhausted after ${apiCalls} request(s). Aborting. Remaining books will stay unpatched until the quota resets (midnight Pacific Time) or you switch to a different API key.`,
        );
        console.error(`  last error: ${message}`);
        process.exit(2);
      }
      errors++;
      console.error(`  ! error for "${book.title}":`, message);
    }

    const isLast = i === candidates.length - 1;
    if (!isLast && opts.delayMs > 0 && didApiCall) {
      await sleep(opts.delayMs);
    }
  }

  console.log(
    `backfill-google-books: done. covers=${coversFilled} isbns=${isbnsFilled} (local=${isbnsFromLocal}, api=${isbnsFromApi}) pageCounts=${pageCountsFilled} volumesByIsbn=${volumesByIsbn} volumesByTitle=${volumesByTitle} notFound=${notFound} errors=${errors} apiCalls=${apiCalls}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
