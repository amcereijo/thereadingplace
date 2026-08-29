/**
 * scripts/backfill-covers.ts
 *
 * One-shot script: walk every `books` row that does not yet have a cover URL
 * in `metadata.coverUrl`, look the title up on Google Books, and write the
 * first thumbnail back to `metadataJson`. Idempotent — re-running is safe and
 * never overwrites an existing coverUrl.
 *
 * Usage:
 *   GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-covers.ts
 *   GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-covers.ts --delay-ms 1500
 *
 * Notes:
 *   - Reads GOOGLE_BOOKS_API_KEY from the environment. The key is the same one
 *     used by the in-app search endpoint in app/api/books/search/route.ts.
 *   - The search query is sanitized via lib/google-books.ts cleanBookQuery:
 *     Amazon-style edition suffixes like "(Spanish Edition)" are stripped and
 *     the query is truncated to 80 chars to avoid 503s on long titles.
 *   - Google Books Volumes API has a documented per-second rate limit AND a
 *     daily quota per project. The script sleeps between requests to stay
 *     under the per-second limit (default 1100ms). Tune with --delay-ms.
 *   - On a daily-quota error the script retries with exponential backoff up
 *     to --max-retries times, then aborts with exit code 2 and a clear
 *     message.
 *   - On a non-quota error (e.g. 503 from a malformed query), the script
 *     logs the error and moves on to the next book.
 *   - Runs sequentially. One Google Books request per book.
 *   - Does not touch any field other than `metadataJson` on `books`.
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
        "Usage: GOOGLE_BOOKS_API_KEY=... npx tsx scripts/backfill-covers.ts [--delay-ms <ms>] [--max-retries <n>]",
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

function hasCoverUrl(metadata: Record<string, unknown>): boolean {
  const raw = metadata.coverUrl;
  return typeof raw === "string" && raw.trim().length > 0;
}

async function loadMissingBooks(): Promise<BookRow[]> {
  const rows = await db.select().from(books);
  return rows
    .filter((row) => !hasCoverUrl(parseMetadata(row.metadataJson)))
    .map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      metadataJson: row.metadataJson,
    }));
}

async function writeCoverUrl(id: string, metadata: Record<string, unknown>): Promise<void> {
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
  opts: CliOptions,
): Promise<Awaited<ReturnType<typeof searchVolumes>>> {
  let attempt = 0;
  let backoff = 2000;
  while (true) {
    try {
      return await searchVolumes(query, "en");
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

async function main() {
  if (!process.env.GOOGLE_BOOKS_API_KEY) {
    throw new Error("GOOGLE_BOOKS_API_KEY is not configured");
  }

  const opts = parseArgs(process.argv.slice(2));
  const candidates = await loadMissingBooks();
  console.log(
    `backfill-covers: ${candidates.length} book(s) without a cover URL (delay=${opts.delayMs}ms, maxRetries=${opts.maxRetries})`,
  );

  let found = 0;
  let notFound = 0;
  let errors = 0;
  let apiCalls = 0;

  for (let i = 0; i < candidates.length; i++) {
    const book = candidates[i];
    const query = cleanBookQuery(book.author ? `${book.title} ${book.author}` : book.title);

    try {
      apiCalls++;
      const result = await searchWithRetry(query, opts);
      const volume = result.results[0];
      const coverUrl = volume?.imageLinks?.thumbnail ?? volume?.imageLinks?.smallThumbnail ?? null;
      if (!coverUrl) {
        notFound++;
        console.log(`  no cover: "${book.title}"`);
      } else {
        const metadata = parseMetadata(book.metadataJson);
        metadata.coverUrl = coverUrl;
        await writeCoverUrl(book.id, metadata);
        found++;
        console.log(`  + cover: "${book.title}"`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isDailyQuotaMessage(message)) {
        console.error(
          `\nbackfill-covers: Google Books daily quota exhausted after ${apiCalls} request(s). Aborting. Remaining books will stay without a cover until the quota resets (midnight Pacific Time) or you switch to a different API key.`,
        );
        console.error(`  last error: ${message}`);
        process.exit(2);
      }
      errors++;
      console.error(`  ! error for "${book.title}" (query: "${query}"):`, message);
    }

    const isLast = i === candidates.length - 1;
    if (!isLast && opts.delayMs > 0) {
      await sleep(opts.delayMs);
    }
  }

  console.log(
    `backfill-covers: done. found=${found} notFound=${notFound} errors=${errors} apiCalls=${apiCalls}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
