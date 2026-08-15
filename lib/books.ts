import { and, count, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { books } from "./db/schema";
import {
  type BookFormat,
  type BookRecord,
  type BookStatus,
  isBookFormat,
  isBookStatus,
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function parseFormats(raw: string): BookFormat[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is BookFormat => typeof value === "string" && isBookFormat(value));
  } catch {
    return [];
  }
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

function toBook(row: typeof books.$inferSelect): BookRecord {
  if (!isBookStatus(row.status)) {
    throw new Error("Invalid book status");
  }
  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    status: row.status,
    formats: parseFormats(row.formatsJson),
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    abandonedAt: row.abandonedAt,
    dateAdded: row.dateAdded,
    note: row.note,
    metadata: parseMetadata(row.metadataJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listBooks(ownerId: string, status?: BookStatus) {
  const rows = status
    ? await db
        .select()
        .from(books)
        .where(and(eq(books.ownerId, ownerId), eq(books.status, status)))
        .orderBy(desc(books.dateAdded))
    : await db
        .select()
        .from(books)
        .where(eq(books.ownerId, ownerId))
        .orderBy(desc(books.dateAdded));
  return rows.map(toBook);
}

export async function getBook(id: string) {
  const [row] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return row ? toBook(row) : null;
}

export async function createBook(input: {
  ownerId: string;
  title: string;
  status: BookStatus;
  formats: BookFormat[];
  startedAt: string | null;
  finishedAt: string | null;
  abandonedAt: string | null;
  dateAdded?: string | null;
  note: string | null;
  metadata?: Record<string, unknown>;
}) {
  const timestamp = nowIso();
  const id = crypto.randomUUID();
  await db.insert(books).values({
    id,
    ownerId: input.ownerId,
    title: input.title,
    status: input.status,
    formatsJson: JSON.stringify(input.formats),
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    abandonedAt: input.abandonedAt,
    dateAdded: input.dateAdded,
    note: input.note,
    metadataJson: JSON.stringify(input.metadata ?? {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return id;
}

export async function updateBook(
  id: string,
  input: {
    title: string;
    status: BookStatus;
    formats: BookFormat[];
    startedAt: string | null;
    finishedAt: string | null;
    abandonedAt: string | null;
    dateAdded?: string | null;
    note: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  await db
    .update(books)
    .set({
      title: input.title,
      status: input.status,
      formatsJson: JSON.stringify(input.formats),
      startedAt: input.startedAt,
      finishedAt: input.finishedAt,
      abandonedAt: input.abandonedAt,
      dateAdded: input.dateAdded,
      note: input.note,
      metadataJson: JSON.stringify(input.metadata ?? {}),
      updatedAt: nowIso(),
    })
    .where(eq(books.id, id));
}

export async function deleteBook(id: string) {
  await db.delete(books).where(eq(books.id, id));
}

export type BookCounts = { all: number } & Record<BookStatus, number>;

export async function countBooksByStatus(ownerId: string): Promise<BookCounts> {
  const rows = await db
    .select({ status: books.status, n: count() })
    .from(books)
    .where(eq(books.ownerId, ownerId))
    .groupBy(books.status);

  const counts: BookCounts = {
    all: 0,
    "to-read": 0,
    reading: 0,
    read: 0,
    abandoned: 0,
  };

  for (const row of rows) {
    if (isBookStatus(row.status)) {
      counts[row.status] = row.n;
      counts.all += row.n;
    }
  }

  return counts;
}
