import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { INVITE_COOKIE } from "./auth-constants";
import { db } from "./db";
import { users } from "./db/schema";
import type { AppUser } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function toUser(row: typeof users.$inferSelect): AppUser {
  return {
    id: row.id,
    clerkId: row.clerkId,
    username: row.username,
    pendingInviteToken: row.pendingInviteToken,
    createdAt: row.createdAt,
  };
}

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string) {
  return /^[a-z0-9_]{3,32}$/.test(normalizeUsername(raw));
}

export async function getUserByClerkId(clerkId: string) {
  const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return row ? toUser(row) : null;
}

export async function getUserByUsername(username: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.username, normalizeUsername(username)))
    .limit(1);
  return row ? toUser(row) : null;
}

export async function ensureUser(clerkId: string) {
  const existing = await getUserByClerkId(clerkId);
  if (existing) return { user: existing, created: false };

  const jar = await cookies();
  const pendingInviteToken = jar.get(INVITE_COOKIE)?.value ?? null;
  const user: AppUser = {
    id: crypto.randomUUID(),
    clerkId,
    username: null,
    pendingInviteToken,
    createdAt: nowIso(),
  };
  await db.insert(users).values(user);
  return { user, created: true };
}

export async function claimUsername(userId: string, username: string) {
  const normalized = normalizeUsername(username);
  await db.update(users).set({ username: normalized }).where(eq(users.id, userId));
}

export async function clearPendingInvite(userId: string) {
  await db.update(users).set({ pendingInviteToken: null }).where(eq(users.id, userId));
}
