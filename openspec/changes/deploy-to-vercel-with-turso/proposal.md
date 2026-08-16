## Why

The app currently runs only on a local developer machine with a SQLite file. To make it available to users, we need automated production deployments triggered by merges to `main` and a hosted database that works with Vercel's serverless environment.

## What Changes

- Add production database connectivity to a hosted Turso (libsql) database, while keeping local development on SQLite.
- Add a GitHub Actions workflow that runs lint/type checks, applies database migrations against Turso, and deploys the app to Vercel on every push to `main`.
- Update environment variable handling so production uses Vercel/Turso secrets and local development uses `.env.local`.
- Add deployment documentation describing how to set up Turso, Vercel, and GitHub secrets.

## Capabilities

### New Capabilities
- `deployment`: defines the continuous deployment pipeline from GitHub to Vercel and the required secrets/environment setup.
- `turso-database`: defines how the app connects to a hosted Turso database in production and falls back to local SQLite for development.

### Modified Capabilities
- `goodreads-import`: no requirement changes.
- `book-shelf`: no requirement changes.
- `books`: no requirement changes.

## Impact

- `lib/db/index.ts` and `scripts/migrate.ts` gain Turso connection support.
- New `.github/workflows/deploy.yml` file.
- Vercel project must be created and linked to the GitHub repo.
- Turso database must be created and its URL/token added to GitHub and Vercel secrets.
- Clerk production keys must be configured in Vercel environment variables.
- Local development remains unchanged.
