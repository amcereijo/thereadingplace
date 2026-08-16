import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

async function migrate() {
  const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
  const databaseUrl = process.env.DATABASE_URL ?? `file:${dbPath}`;
  const migrationsDir = path.join(process.cwd(), "drizzle");

  if (databaseUrl.startsWith("file:")) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const client = createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id TEXT PRIMARY KEY
    )
  `);

  const appliedResult = await client.execute("SELECT id FROM __migrations");
  const applied = new Set(appliedResult.rows.map((row) => String(row.id)));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const statements = fs
      .readFileSync(path.join(migrationsDir, file), "utf8")
      .split("--> statement-breakpoint")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await client.execute(statement);
    }
    await client.execute({
      sql: "INSERT INTO __migrations (id) VALUES (?)",
      args: [file],
    });
    console.log(`applied ${file}`);
  }

  client.close();
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
