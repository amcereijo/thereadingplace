import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { books } from "./db/schema";
import { type BookFormat, type BookStatus, isBookStatus } from "./types";
import { type ParsedBook } from "./goodreads";

export interface ImportProgress {
  total: number;
  processed: number;
  imported: number;
  skipped: number;
  errors: number;
}

export function mapGoodreadsToBookStatus(
  exclusiveShelf: string
): BookStatus {
  const shelfMap: Record<string, BookStatus> = {
    read: "read",
    "currently-reading": "reading",
    "to-read": "to-read",
  };

  const status = shelfMap[exclusiveShelf.toLowerCase()];
  return status && isBookStatus(status) ? status : "to-read";
}

export function mapGoodreadsToBookFormat(binding: string): BookFormat {
  const bindingLower = binding.toLowerCase();

  if (bindingLower.includes("kindle") || bindingLower.includes("ebook")) {
    return "ebook";
  }
  if (bindingLower.includes("audiobook") || bindingLower.includes("audible")) {
    return "audiobook";
  }
  if (bindingLower.includes("hardcover")) {
    return "hardcover";
  }
  if (bindingLower.includes("paperback")) {
    return "paperback";
  }

  return "paperback";
}

export async function findDuplicateByIsbn(
  isbn: string,
  ownerId: string
): Promise<boolean> {
  if (!isbn) return false;

  const existing = await db
    .select({ id: books.id })
    .from(books)
    .where(and(eq(books.ownerId, ownerId), eq(books.title, isbn)))
    .limit(1);

  return existing.length > 0;
}

export async function findDuplicateByTitleAndAuthor(
  title: string,
  author: string,
  ownerId: string
): Promise<boolean> {
  const existing = await db
    .select({ id: books.id })
    .from(books)
    .where(
      and(
        eq(books.ownerId, ownerId),
        eq(books.title, title)
      )
    )
    .limit(1);

  return existing.length > 0;
}

export async function importBooks(
  parsedBooks: ParsedBook[],
  ownerId: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportProgress> {
  const progress: ImportProgress = {
    total: parsedBooks.length,
    processed: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  for (const book of parsedBooks) {
    try {
      const isDuplicateByIsbn = book.isbn
        ? await findDuplicateByIsbn(book.isbn, ownerId)
        : false;

      if (isDuplicateByIsbn) {
        progress.skipped++;
        progress.processed++;
        onProgress?.(progress);
        continue;
      }

      const isDuplicateByTitle = await findDuplicateByTitleAndAuthor(
        book.title,
        book.author,
        ownerId
      );

      if (isDuplicateByTitle) {
        progress.skipped++;
        progress.processed++;
        onProgress?.(progress);
        continue;
      }

      const status = mapGoodreadsToBookStatus(book.exclusiveShelf);
      const format = mapGoodreadsToBookFormat(book.binding);

      const note = [
        book.myReview ? `${book.myReview}` : "",
        book.privateNotes ? `${book.privateNotes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const metadata: Record<string, unknown> = {
        isbn: book.isbn,
        isbn13: book.isbn13,
        rating: book.rating,
        publisher: book.publisher,
        binding: book.binding,
        pageCount: book.pageCount,
        yearPublished: book.yearPublished,
        originalPublicationYear: book.originalPublicationYear,
        bookshelves: book.bookshelves,
        exclusiveShelf: book.exclusiveShelf,
        readCount: book.readCount,
        ownedCopies: book.ownedCopies,
        goodreadsId: book.goodreadsId,
      };

      await db.insert(books).values({
        id: crypto.randomUUID(),
        ownerId,
        title: book.title,
        status,
        formatsJson: JSON.stringify([format]),
        startedAt: null,
        finishedAt: book.dateRead || null,
        abandonedAt: null,
        dateAdded: book.dateAdded || null,
        note: note || null,
        author: book.author || null,
        metadataJson: JSON.stringify(metadata),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      progress.imported++;
    } catch {
      progress.errors++;
    }

    progress.processed++;
    onProgress?.(progress);
  }

  return progress;
}
