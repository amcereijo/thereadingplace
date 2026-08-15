import Papa from "papaparse";
import { type BookFormat, type BookStatus, isBookStatus } from "./types";

export const GOODREADS_COLUMNS = {
  BOOK_ID: "Book Id",
  TITLE: "Title",
  AUTHOR: "Author",
  AUTHOR_LF: "Author l-f",
  ADDITIONAL_AUTHORS: "Additional Authors",
  ISBN: "ISBN",
  ISBN13: "ISBN13",
  MY_RATING: "My Rating",
  PUBLISHER: "Publisher",
  BINDING: "Binding",
  NUMBER_OF_PAGES: "Number of Pages",
  YEAR_PUBLISHED: "Year Published",
  ORIGINAL_PUBLICATION_YEAR: "Original Publication Year",
  DATE_READ: "Date Read",
  DATE_ADDED: "Date Added",
  BOOKSHELVES: "Bookshelves",
  BOOKSHELVES_WITH_POSITIONS: "Bookshelves with positions",
  EXCLUSIVE_SHELF: "Exclusive Shelf",
  MY_REVIEW: "My Review",
  SPOILER: "Spoiler",
  PRIVATE_NOTES: "Private Notes",
  READ_COUNT: "Read Count",
  OWNED_COPIES: "Owned Copies",
} as const;

export type GoodreadsColumn = (typeof GOODREADS_COLUMNS)[keyof typeof GOODREADS_COLUMNS];

export interface ParsedBook {
  goodreadsId: string;
  title: string;
  author: string;
  isbn: string;
  isbn13: string;
  rating: number | null;
  publisher: string;
  binding: string;
  pageCount: number | null;
  yearPublished: number | null;
  originalPublicationYear: number | null;
  dateRead: string | null;
  dateAdded: string | null;
  bookshelves: string;
  exclusiveShelf: string;
  myReview: string;
  privateNotes: string;
  readCount: number | null;
  ownedCopies: number;
}

export interface ImportResult {
  totalRows: number;
  parsedBooks: ParsedBook[];
  errors: string[];
  validColumns: string[];
  missingColumns: string[];
}

export function validateCsvHeaders(headers: string[]): {
  valid: string[];
  missing: string[];
} {
  const requiredColumns = [GOODREADS_COLUMNS.TITLE, GOODREADS_COLUMNS.AUTHOR];
  
  const valid = headers.filter((header) =>
    Object.values(GOODREADS_COLUMNS).includes(header as GoodreadsColumn)
  );
  
  const missing = requiredColumns.filter(
    (col) => !headers.includes(col)
  );
  
  return { valid, missing };
}

export function parseGoodreadsCsv(csvContent: string): ImportResult {
  const result: ImportResult = {
    totalRows: 0,
    parsedBooks: [],
    errors: [],
    validColumns: [],
    missingColumns: [],
  };

  try {
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      result.errors.push(
        ...parsed.errors.map((e) => `Row ${e.row}: ${e.message}`)
      );
    }

    if (parsed.meta.fields) {
      const validation = validateCsvHeaders(parsed.meta.fields);
      result.validColumns = validation.valid;
      result.missingColumns = validation.missing;
      
      if (validation.missing.length > 0) {
        result.errors.push(
          `Missing required columns: ${validation.missing.join(", ")}`
        );
      }
    }

    result.totalRows = parsed.data.length;

    for (const row of parsed.data) {
      try {
        const book = mapRowToBook(row as Record<string, string>);
        result.parsedBooks.push(book);
      } catch (e) {
        result.errors.push(
          `Row ${parsed.data.indexOf(row) + 1}: ${e instanceof Error ? e.message : "Invalid data"}`
        );
      }
    }
  } catch (e) {
    result.errors.push(
      `Failed to parse CSV: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }

  return result;
}

function mapRowToBook(row: Record<string, string>): ParsedBook {
  const title = row[GOODREADS_COLUMNS.TITLE]?.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const author = row[GOODREADS_COLUMNS.AUTHOR]?.trim();
  if (!author) {
    throw new Error("Author is required");
  }

  return {
    goodreadsId: row[GOODREADS_COLUMNS.BOOK_ID]?.trim() || "",
    title,
    author,
    isbn: cleanIsbn(row[GOODREADS_COLUMNS.ISBN]),
    isbn13: cleanIsbn(row[GOODREADS_COLUMNS.ISBN13]),
    rating: parseRating(row[GOODREADS_COLUMNS.MY_RATING]),
    publisher: row[GOODREADS_COLUMNS.PUBLISHER]?.trim() || "",
    binding: row[GOODREADS_COLUMNS.BINDING]?.trim() || "",
    pageCount: parseNumber(row[GOODREADS_COLUMNS.NUMBER_OF_PAGES]),
    yearPublished: parseNumber(row[GOODREADS_COLUMNS.YEAR_PUBLISHED]),
    originalPublicationYear: parseNumber(
      row[GOODREADS_COLUMNS.ORIGINAL_PUBLICATION_YEAR]
    ),
    dateRead: parseDate(row[GOODREADS_COLUMNS.DATE_READ]),
    dateAdded: parseDate(row[GOODREADS_COLUMNS.DATE_ADDED]),
    bookshelves: row[GOODREADS_COLUMNS.BOOKSHELVES]?.trim() || "",
    exclusiveShelf: row[GOODREADS_COLUMNS.EXCLUSIVE_SHELF]?.trim() || "",
    myReview: row[GOODREADS_COLUMNS.MY_REVIEW]?.trim() || "",
    privateNotes: row[GOODREADS_COLUMNS.PRIVATE_NOTES]?.trim() || "",
    readCount: parseNumber(row[GOODREADS_COLUMNS.READ_COUNT]),
    ownedCopies: parseNumber(row[GOODREADS_COLUMNS.OWNED_COPIES]) || 0,
  };
}

function cleanIsbn(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/="|"/g, "").trim();
}

function parseRating(value: string | undefined): number | null {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

function parseDate(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().split("T")[0];
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