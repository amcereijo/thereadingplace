import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function resolveDatabaseUrl() {
  console.log('process.env.DATABASE_PATH', process.env.DATABASE_PATH);
  console.log('process.env.TURSO_DATABASE_URL', process.env.TURSO_DATABASE_URL);

  const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
  // Prefer the explicit TURSO_DATABASE_URL so the Vercel Turso integration cannot
  // silently inject a per-deployment branch database via DATABASE_URL.
  return process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? `file:${dbPath}`;
}

function isDuringNextBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function assertNotBranchDatabase(url: string) {
  if (!isDuringNextBuild() && /^libsql:\/\/dpl-[^.]+\./i.test(url)) {
    throw new Error(
      `Refusing to connect to a Turso branch database (resolved URL: ${url}). Set TURSO_DATABASE_URL to the main database URL in your Vercel project settings and unset any Turso integration-provided DATABASE_URL.`
    );
  }
}

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (cachedDb) return cachedDb;

  const databaseUrl = resolveDatabaseUrl();
  if (process.env.VERCEL === "1") {
    console.log(`[db] resolved database url: ${databaseUrl}`);
  }
  assertNotBranchDatabase(databaseUrl);

  if (databaseUrl.startsWith("file:")) {
    const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const client = createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  cachedDb = drizzle(client, { schema });
  return cachedDb;
}

// Keep the old `db` export for callers that do not need lazy creation. It is
// created on first import, so it is safe for non-build usage.
export const db = getDb();
