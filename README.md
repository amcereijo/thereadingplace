This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Production deployment setup

This app deploys automatically to Vercel when code is pushed to the `main` branch. It uses a hosted [Turso](https://turso.tech) database in production, while local development continues to use SQLite.

#### 1. Create a Turso database

1. Sign in at [turso.tech](https://turso.tech) and install the Turso CLI if needed.
2. Create a database:
   ```bash
   turso db create thereadingplace
   ```
3. Get the database URL:
   ```bash
   turso db show thereadingplace --url
   ```
4. Create an auth token:
   ```bash
   turso db tokens create thereadingplace
   ```

#### 2. Create a Vercel project

1. Import the GitHub repository in the Vercel dashboard.
2. In the project settings, add these environment variables under **Settings → Environment Variables**:
   - `TURSO_DATABASE_URL` — the Turso database URL from step 1
   - `TURSO_AUTH_TOKEN` — the Turso auth token from step 1
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — your Clerk production publishable key
   - `CLERK_SECRET_KEY` — your Clerk production secret key
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — `/sign-up`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` — `/`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` — `/`

   Make sure these are configured for the **Production** environment.

#### 3. Add GitHub repository secrets

In the GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel organization ID (from project settings) |
| `VERCEL_PROJECT_ID` | Vercel project ID (from project settings) |

#### 4. Verify the deployment

Push to `main` or merge a pull request. The GitHub Actions workflow will run lint and type checks, apply database migrations, and deploy the app to Vercel production.

## Operational scripts

The project ships a few scripts under `scripts/` that talk to the production database directly. Run them with `npm run <script>` and the required env vars in scope.

### `npm run db:migrate`

Apply Drizzle migrations from `drizzle/` against the configured database (Turso in production, local SQLite in dev).

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:migrate
```

### `npm run db:smoke`

End-to-end smoke test against the configured database. Creates a couple of throwaway users, exercises book creation, status moves, friendship flows, and invite links, then cleans up. Use it after pulling new code locally to sanity-check the data layer.

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:smoke
```

### `npm run db:backfill-google-books`

One-shot script that fills missing Google-Books-sourced metadata on the `books` table: `metadata.coverUrl`, `metadata.isbn10` / `metadata.isbn13` / `metadata.isbn`, and `metadata.pageCount`. Books that already have all three pieces are skipped entirely (no API call, no DB write).

Per-book strategy:

1. If the row already has any of `metadata.isbn`, `metadata.isbn13`, `metadata.isbn10` locally, the script first queries Google Books using the `q=isbn:<value>` search syntax via `searchByIsbn` in `lib/google-books.ts`. The first matching volume is then used to fill anything that's still missing.
2. Otherwise (or when the ISBN lookup returns nothing), it falls back to a title-based search. The title is sanitized via `shortTitleForQuery` in `scripts/backfill-google-books.ts`, which strips Amazon-style edition suffixes (`(Spanish Edition)`, `(Edición española)`, etc.) and truncates at `:` / `–` / `—` / `-`, so `"Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones"` becomes `"Atomic Habits"`.
3. Results are ordered by author match (case- and diacritic-insensitive prefix match, so `"Miguel Ángel Montero"` matches `"Miguel Ángel Montero García"`), so the first hit is the most likely edition. Author matching is done locally — never sent to Google Books.

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... GOOGLE_BOOKS_API_KEY=... \
  npm run db:backfill-google-books
```

Notes:
- Idempotent. Re-running is safe and never overwrites an existing field.
- At most one Google Books request per book (two only when the ISBN lookup misses and the script falls back to a title search).
- Targets the database configured via env vars: with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` set it talks to Turso; otherwise it falls back to the local SQLite file at `data/app.db`.
- Sleeps between requests (default 1100 ms) to stay under Google Books' documented ~1 req/s rate limit. The same `--delay-ms` applies regardless of whether the call was an ISBN lookup or a title search. Tune it if your key has a different quota.
- Logs mark which concept triggered each Google Books request with `[concept: isbn]` or `[concept: title]`, and each filled field is tagged with its source — e.g. `+ cover (api/isbn), isbn (api/isbn): "Title"` means both fields came from the ISBN lookup, while `+ pageCount (api/title)` means only the page count was filled from the title search. Books whose local ISBN was enough to satisfy the gap are logged as `+ isbn (local)`.
- On a daily-quota error the script retries a few times with exponential backoff, then aborts with exit code 2 and a clear message. Remaining rows are left untouched for the next run.
- Only touches `metadata_json` and `updated_at` on `books`.
- For local development, load `.env.local` first to avoid passing env vars on every command:
  ```bash
  set -a; source .env.local; set +a
  npm run db:backfill-google-books
  ```

### `npm run db:migrate-isbn`

One-shot migration that normalizes the ISBN shape inside `metadata_json` on every `books` row so downstream consumers can rely on a single canonical layout:

```json
{ "isbn10": "...", "isbn13": "...", "isbn": "<isbn13 ó isbn10>" }
```

`isbn10` and `isbn13` are kept as separate keys whenever Google Books (or the Goodreads CSV column "ISBN13") provides them. `isbn` is always derived — preferring ISBN-13, falling back to ISBN-10 — so existing readers that only look up `metadata.isbn` keep working regardless of which flavour was stored.

The script is idempotent: re-running on an already-migrated database is a no-op.

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:migrate-isbn
# Review the impact first, no writes:
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:migrate-isbn -- --dry-run
```

Notes:
- Only touches `metadata_json` and `updated_at` on `books`.
- Validates ISBN-10 and ISBN-13 checksums; malformed values are dropped and reclassified when possible (e.g. a generic `metadata.isbn` containing a valid ISBN-13 is moved to `metadata.isbn13`).
- Run this once after pulling changes that introduced the canonical shape, so older rows written by Google Books or the Goodreads importer match what new writes produce.
- For local development, load `.env.local` first to avoid passing env vars on every command:
  ```bash
  set -a; source .env.local; set +a
  npm run db:migrate-isbn
  ```
