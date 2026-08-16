import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
const databaseUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL ?? `file:${dbPath}`;

if (databaseUrl.startsWith("file:")) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
