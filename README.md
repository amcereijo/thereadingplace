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

### `npm run db:backfill-covers`

One-shot script that walks every `books` row without `metadata.coverUrl`, looks the title up on Google Books, and writes the first thumbnail back to `metadataJson`. Use it after enabling the cover-thumbnails feature to populate covers for books added before that release (and any book added without going through the typeahead).

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... GOOGLE_BOOKS_API_KEY=... \
  npm run db:backfill-covers
```

Notes:
- Idempotent. Re-running is safe and never overwrites an existing `metadata.coverUrl`.
- Sleeps between requests (default 1100 ms) to stay under Google Books' documented ~1 req/s rate limit. Tune with `--delay-ms` if your key has different quota.
- On a daily-quota error the script retries a few times, then aborts with exit code 2 and a clear message. Remaining rows are left untouched for the next run.
- Long titles are sanitized via `cleanBookQuery` in `lib/google-books.ts` before being sent, so Amazon-style edition suffixes like "(Spanish Edition)" do not trigger 503s.
- For local development, load `.env.local` first to avoid passing env vars on every command:
  ```bash
  set -a; source .env.local; set +a
  npm run db:backfill-covers
  ```

### `npm run db:backfill-metadata`

One-shot script that fills missing `metadata.isbn` and `metadata.pageCount` values on the `books` table.

ISBN is filled from `metadata.isbn13` / `metadata.isbn10` if already present locally; otherwise the script queries Google Books and takes the first ISBN from the result whose author matches the local author (case- and diacritic-insensitive prefix match, so `"Miguel Ángel Montero"` matches `"Miguel Ángel Montero García"`).

pageCount is filled from the first Google Books result (after the same author-weighted ordering) that exposes a numeric `pageCount`.

The Google Books query is just the title — author matching is done locally against the returned results, never sent. The title is sanitized via `shortTitleForQuery` in `scripts/backfill-metadata.ts`, which strips Amazon-style edition suffixes (`(Spanish Edition)`, `(Edición española)`, etc.) and truncates at `:` / `–` / `—` / `-`, so `"Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones"` becomes `"Atomic Habits"`.

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... GOOGLE_BOOKS_API_KEY=... \
  npm run db:backfill-metadata
```

Notes:
- Idempotent. Re-running is safe and never overwrites an existing `metadata.isbn` or `metadata.pageCount`.
- Targets the database configured via env vars: with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` set it talks to Turso; otherwise it falls back to the local SQLite file at `data/app.db`.
- Same delay / retry / abort behavior as `db:backfill-covers`. Tune with `--delay-ms` and `--max-retries`.
- For local development, load `.env.local` first to avoid passing env vars on every command:
  ```bash
  set -a; source .env.local; set +a
  npm run db:backfill-metadata
  ```
