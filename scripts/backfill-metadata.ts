/**
 * scripts/backfill-metadata.ts
 *
 * One-shot script: walk every `books` row whose `metadata_json` is missing
 * `isbn` or `pageCount`, fill the gap, and write back. Idempotent — re-running
 * is safe and never overwrites an existing value.
 *
 * Filling order:
 *   1. ISBN is filled from `metadata.isbn13` or `metadata.isbn10` if already
 *      present locally (no Google Books request). Otherwise it is filled from
 *      the first Google Books result whose `industryIdentifiers` includes an
 *      ISBN-13 or ISBN-10.
 *   2. pageCount is filled from the first Google Books result whose
 *      `pageCount` is a number.
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
 *   GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-metadata.ts
 *   GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-metadata.ts --delay-ms 1500
 *
 * Notes:
 *   - Same rate-limit / retry behavior as scripts/backfill-covers.ts.
 *   - Runs sequentially. One Google Books request per book.
 *   - Only touches `metadata_json` and `updated_at` on `books`.
 */

import { eq } from "drizzle-orm";
import { GoogleBooksError, cleanBookQuery, searchVolumes } from "../lib/google-books";
import { db } from "../lib/db";
import { books } from "../lib/db/schema";

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
        throw new Error(`--max-retries must be a non-negative integer, got ${argv[i]}`);
      }
      opts.maxRetries = value;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-metadata.ts [--delay-ms <ms>] [--max-retries <n>]",
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

function hasIsbn(metadata: Record<string, unknown>): boolean {
  const raw = metadata.isbn;
  return typeof raw === "string" && raw.trim().length > 0;
}

function hasPageCount(metadata: Record<string, unknown>): boolean {
  return typeof metadata.pageCount === "number" && Number.isFinite(metadata.pageCount);
}

function extractLocalIsbn(metadata: Record<string, unknown>): string | null {
  const isbn13 = metadata.isbn13;
  if (typeof isbn13 === "string" && isbn13.trim().length > 0) return isbn13.trim();
  const isbn10 = metadata.isbn10;
  if (typeof isbn10 === "string" && isbn10.trim().length > 0) return isbn10.trim();
  return null;
}

function extractIsbnFromResults(
  results: Awaited<ReturnType<typeof searchVolumes>>["results"],
  expectedAuthor: string | null,
): string | null {
  const ordered = orderByAuthor(results, expectedAuthor);
  for (const volume of ordered) {
    const isbn = extractIsbnFromResult(volume);
    if (isbn !== null) return isbn;
  }
  return null;
}

function extractIsbnFromResult(volume: Awaited<ReturnType<typeof searchVolumes>>["results"][number]): string | null {
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

function extractPageCountFromResults(
  results: Awaited<ReturnType<typeof searchVolumes>>["results"],
  expectedAuthor: string | null,
): number | null {
  const ordered = orderByAuthor(results, expectedAuthor);
  for (const volume of ordered) {
    if (typeof volume.pageCount === "number" && Number.isFinite(volume.pageCount)) {
      return volume.pageCount;
    }
  }
  return null;
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
  // Reduce "Main: Subtitle" / "Main - Subtitle" to "Main".
  const colonMatch = cleaned.match(/^([^:–—-]{2,80}?)\s*[:–—\-]\s+/);
  if (colonMatch) {
    cleaned = colonMatch[1].trim();
  }
  return cleaned;
}

async function loadMissingBooks(): Promise<BookRow[]> {
  const rows = await db.select().from(books);
  return rows
    .filter((row) => {
      const metadata = parseMetadata(row.metadataJson);
      return !hasIsbn(metadata) || !hasPageCount(metadata);
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

async function searchWithRetry(
  query: string,
  locale: "en" | "es",
  opts: CliOptions,
): Promise<Awaited<ReturnType<typeof searchVolumes>>> {
  let attempt = 0;
  let backoff = 2000;
  while (true) {
    try {
      return await searchVolumes(query, locale);
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

function detectLocale(book: BookRow): "en" | "es" {
  if (/[áéíóúñ¿¡]/i.test(book.title)) return "es";
  if (book.author && /[áéíóúñ¿¡]/i.test(book.author)) return "es";
  return "en";
}

async function main() {
  if (!process.env.GOOGLE_BOOKS_API_KEY) {
    throw new Error("GOOGLE_BOOKS_API_KEY is not configured");
  }

  const opts = parseArgs(process.argv.slice(2));
  const candidates = await loadMissingBooks();
  console.log(
    `backfill-metadata: ${candidates.length} book(s) need isbn or pageCount (delay=${opts.delayMs}ms, maxRetries=${opts.maxRetries})`,
  );

  let isbnFilled = 0;
  let pageCountFilled = 0;
  let isbnFromLocal = 0;
  let notFound = 0;
  let errors = 0;
  let apiCalls = 0;

  for (let i = 0; i < candidates.length; i++) {
    const book = candidates[i];
    const metadata = parseMetadata(book.metadataJson);
    const needsIsbn = !hasIsbn(metadata);
    const needsPageCount = !hasPageCount(metadata);

    if (!needsIsbn && !needsPageCount) continue;

    const localIsbn = needsIsbn ? extractLocalIsbn(metadata) : null;
    if (needsIsbn && localIsbn) {
      metadata.isbn = localIsbn;
      isbnFilled++;
      isbnFromLocal++;
      await writeMetadata(book.id, metadata);
      console.log(`  + isbn (local): "${book.title}" -> ${localIsbn}`);
    }

    let didApiCall = false;
    if (needsPageCount || (needsIsbn && !localIsbn)) {
      const locale = detectLocale(book);
      const query = shortTitleForQuery(book.title);

      try {
        apiCalls++;
        didApiCall = true;
        const result = await searchWithRetry(query, locale, opts);

        if (needsIsbn && !localIsbn) {
          const isbn = extractIsbnFromResults(result.results, book.author);
          if (isbn) {
            metadata.isbn = isbn;
            isbnFilled++;
            console.log(`  + isbn (api): "${book.title}" -> ${isbn}`);
          }
        }

        if (needsPageCount) {
          const pageCount = extractPageCountFromResults(result.results, book.author);
          if (pageCount !== null) {
            metadata.pageCount = pageCount;
            pageCountFilled++;
            console.log(`  + pageCount: "${book.title}" -> ${pageCount}`);
          }
        }

        await writeMetadata(book.id, metadata);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isDailyQuotaMessage(message)) {
          console.error(
            `\nbackfill-metadata: Google Books daily quota exhausted after ${apiCalls} request(s). Aborting. Remaining books will stay unpatched until the quota resets (midnight Pacific Time) or you switch to a different API key.`,
          );
          console.error(`  last error: ${message}`);
          process.exit(2);
        }
        errors++;
        console.error(`  ! error for "${book.title}" (query: "${query}"):`, message);
      }
    }

    if (!didApiCall && !needsIsbn) {
      notFound++;
    } else if (
      didApiCall &&
      (needsIsbn && !metadata.isbn && !localIsbn) &&
      (needsPageCount && !hasPageCount(metadata))
    ) {
      notFound++;
    }

    const isLast = i === candidates.length - 1;
    if (!isLast && opts.delayMs > 0 && didApiCall) {
      await sleep(opts.delayMs);
    }
  }

  console.log(
    `backfill-metadata: done. isbnFilled=${isbnFilled} (local=${isbnFromLocal}) pageCountFilled=${pageCountFilled} notFound=${notFound} errors=${errors} apiCalls=${apiCalls}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});