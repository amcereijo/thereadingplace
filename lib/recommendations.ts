import { and, eq, or, sql } from "drizzle-orm";
import { db } from "./db";
import { recommendations } from "./db/schema";
import { copyBookFromSnapshot } from "./books";
import {
  isRecommendationStatus,
  type BookFormat,
  type BookStatus,
  type RecommendationRecord,
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function todayYmd() {
  return nowIso().slice(0, 10);
}

function parseFormats(raw: string): BookFormat[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is BookFormat => typeof value === "string");
  } catch {
    return [];
  }
}

function toRecord(row: typeof recommendations.$inferSelect): RecommendationRecord {
  if (!isRecommendationStatus(row.status)) {
    throw new Error("Invalid recommendation status");
  }
  return {
    id: row.id,
    senderId: row.senderId,
    receiverId: row.receiverId,
    bookId: row.bookId,
    title: row.title,
    author: row.author,
    formats: parseFormats(row.formatsJson),
    note: row.note,
    message: row.message,
    reply: row.reply,
    replyAt: row.replyAt,
    status: row.status,
    sentAt: row.sentAt,
    seenAt: row.seenAt,
    acceptedAt: row.acceptedAt,
    dismissedAt: row.dismissedAt,
  };
}

export async function sendRecommendation(input: {
  senderId: string;
  receiverId: string;
  bookId: string;
  title: string;
  author: string | null;
  formats: BookFormat[];
  note: string | null;
  message?: string | null;
}): Promise<RecommendationRecord> {
  const id = crypto.randomUUID();
  const timestamp = nowIso();
  await db.insert(recommendations).values({
    id,
    senderId: input.senderId,
    receiverId: input.receiverId,
    bookId: input.bookId,
    title: input.title,
    author: input.author,
    formatsJson: JSON.stringify(input.formats),
    note: input.note,
    message: input.message?.trim() ? input.message.trim() : null,
    status: "pending",
    sentAt: timestamp,
    seenAt: null,
    acceptedAt: null,
    dismissedAt: null,
  });
  const row = await getRecommendation(id);
  if (!row) throw new Error("Failed to create recommendation");
  return row;
}

export async function getRecommendation(id: string): Promise<RecommendationRecord | null> {
  const [row] = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.id, id))
    .limit(1);
  return row ? toRecord(row) : null;
}

export async function listReceived(userId: string): Promise<RecommendationRecord[]> {
  const rows = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.receiverId, userId))
    .orderBy(sql`${recommendations.sentAt} DESC`);
  return rows.map(toRecord);
}

export async function listSent(userId: string): Promise<RecommendationRecord[]> {
  const rows = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.senderId, userId))
    .orderBy(sql`${recommendations.sentAt} DESC`);
  return rows.map(toRecord);
}

export async function acceptRecommendation(input: {
  recommendationId: string;
  userId: string;
  status: BookStatus;
  reply?: string | null;
}): Promise<string | null> {
  const row = await getRecommendation(input.recommendationId);
  if (!row || row.receiverId !== input.userId || row.status !== "pending") {
    return null;
  }
  const newBookId = await copyBookFromSnapshot({
    ownerId: input.userId,
    title: row.title,
    author: row.author,
    formats: row.formats,
    note: row.note,
    status: input.status,
  });
  const trimmedReply = input.reply?.trim() ? input.reply.trim() : null;
  await db
    .update(recommendations)
    .set({
      status: "accepted",
      acceptedAt: nowIso(),
      reply: trimmedReply,
      replyAt: trimmedReply ? nowIso() : null,
    })
    .where(eq(recommendations.id, input.recommendationId));
  return newBookId;
}

export async function dismissRecommendation(input: {
  recommendationId: string;
  userId: string;
  reply?: string | null;
}) {
  const row = await getRecommendation(input.recommendationId);
  if (!row || row.receiverId !== input.userId || row.status !== "pending") {
    return false;
  }
  const trimmedReply = input.reply?.trim() ? input.reply.trim() : null;
  await db
    .update(recommendations)
    .set({
      status: "dismissed",
      dismissedAt: nowIso(),
      reply: trimmedReply,
      replyAt: trimmedReply ? nowIso() : null,
    })
    .where(eq(recommendations.id, input.recommendationId));
  return true;
}

export async function countRecommendationsForUser(userId: string): Promise<number> {
  const result = await db
    .select({ n: sql<number>`count(*)` })
    .from(recommendations)
    .where(or(eq(recommendations.receiverId, userId), eq(recommendations.senderId, userId)));
  return Number(result[0]?.n ?? 0);
}

export async function countUnreadReceived(userId: string): Promise<number> {
  const result = await db
    .select({ n: sql<number>`count(*)` })
    .from(recommendations)
    .where(
      and(eq(recommendations.receiverId, userId), eq(recommendations.status, "pending")),
    );
  return Number(result[0]?.n ?? 0);
}

export { todayYmd };
