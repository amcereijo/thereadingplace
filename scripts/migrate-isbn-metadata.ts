/**
 * scripts/migrate-isbn-metadata.ts
 *
 * One-shot migration: normalize ISBN metadata on every `books` row so the
 * canonical shape is `metadata.isbn10` + `metadata.isbn13` plus a derived
 * `metadata.isbn` (preferring ISBN-13, falling back to ISBN-10).
 *
 * Older writes used mixed shapes:
 *   - Google Books (live create): only `isbn10` / `isbn13`.
 *   - Goodreads import: `isbn` (the value of the "ISBN" CSV column, which is
 *     the ISBN-10) + `isbn13`.
 *   - Old backfill: a single `isbn` key.
 *
 * This script makes every row consistent so downstream consumers can rely on a
 * single source of truth. Idempotent: re-running is a no-op once everything is
 * in the canonical shape.
 *
 * Usage:
 *   npx tsx scripts/migrate-isbn-metadata.ts
 *   npx tsx scripts/migrate-isbn-metadata.ts --dry-run
 */

import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { books } from "../lib/db/schema";

type CliOptions = {
  dryRun: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { dryRun: false };
  for (const arg of argv) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: npx tsx scripts/migrate-isbn-metadata.ts [--dry-run]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
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

/**
 * Returns the canonical metadata shape. Never mutates the input object.
 *
 * Migration rules:
 *   1. If both `isbn10` and `isbn13` are present (any order), keep them as-is
 *      and derive `isbn` from the ISBN-13 / ISBN-10 preference.
 *   2. If only `isbn10` is present, keep it and derive `isbn`.
 *   3. If only `isbn13` is present, keep it and derive `isbn`.
 *   4. If only a generic `isbn` is present, classify it (10 vs 13 by format
 *      check) and move it into the proper slot, then derive `isbn`.
 *   5. Strip any leftover `isbn` key that contradicts the derived slot, and
 *      drop malformed values.
 */
function normalizeIsbnMetadata(
  metadata: Record<string, unknown>,
): { next: Record<string, unknown>; changed: boolean } {
  const next: Record<string, unknown> = { ...metadata };
  const before = JSON.stringify(metadata);

  let isbn10 = asString(next.isbn10);
  let isbn13 = asString(next.isbn13);
  const generic = asString(next.isbn);

  if (isbn10 && !isValidIsbn10(isbn10)) isbn10 = null;
  if (isbn13 && !isValidIsbn13(isbn13)) isbn13 = null;

  if (!isbn10 && !isbn13 && generic) {
    if (isValidIsbn13(generic)) isbn13 = generic;
    else if (isValidIsbn10(generic)) isbn10 = generic;
  }

  if (isbn10) next.isbn10 = isbn10;
  else delete next.isbn10;

  if (isbn13) next.isbn13 = isbn13;
  else delete next.isbn13;

  const primary = isbn13 ?? isbn10 ?? null;
  if (primary) next.isbn = primary;
  else delete next.isbn;

  const changed = JSON.stringify(next) !== before;
  return { next, changed };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const rows = await db.select({ id: books.id, metadataJson: books.metadataJson }).from(books);

  let scanned = 0;
  let changed = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    scanned++;
    try {
      const metadata = parseMetadata(row.metadataJson);
      const { next, changed: didChange } = normalizeIsbnMetadata(metadata);
      if (!didChange) {
        skipped++;
        continue;
      }
      changed++;
      console.log(`  + normalize: ${row.id}`);
      if (!opts.dryRun) {
        await db
          .update(books)
          .set({ metadataJson: JSON.stringify(next), updatedAt: new Date().toISOString() })
          .where(eq(books.id, row.id));
      }
    } catch (error) {
      errors++;
      console.error(`  ! error for ${row.id}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(
    `migrate-isbn-metadata${opts.dryRun ? " (dry-run)" : ""}: scanned=${scanned} changed=${changed} skipped=${skipped} errors=${errors}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
