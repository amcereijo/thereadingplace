## Context

See `proposal.md` for motivation. The app currently uses `@libsql/client` to connect to a local SQLite file (`data/app.db`) via Drizzle ORM. `lib/db/index.ts` and `scripts/migrate.ts` both construct a connection using a file URL. Vercel's serverless functions do not have a persistent local filesystem, so the same SQLite approach cannot work in production. The project has no CI/CD workflow and no GitHub Actions beyond an OpenSpec validation workflow.

## Goals / Non-Goals

**Goals:**
- Enable the app to connect to a hosted Turso database in production without breaking local SQLite development.
- Provide a GitHub Actions workflow that runs checks, applies migrations to Turso, and deploys to Vercel on every `main` push.
- Document the required external setup (Turso DB, Vercel project, GitHub/Vercel secrets).

**Non-Goals:**
- Automatic preview deployments or preview databases.
- Migrating existing local SQLite data to Turso.
- Changing the database schema beyond connection-level support.
- Adding monitoring, alerts, or backups beyond what Turso/Vercel provide by default.

## Decisions

### 1. Use Turso for production and keep local SQLite for development
**Rationale:** `@libsql/client` already supports both local file URLs and remote `libsql://` URLs with an auth token. This keeps the ORM and schema unchanged while adding a production host.

**Alternatives considered:**
- Switch to Postgres (Neon/Supabase). Rejected because it requires changing the Drizzle dialect and schema types.
- Use Vercel KV or Blob. Rejected because relational queries and migrations are needed.

### 2. Database URL chosen via `DATABASE_URL` env var
**Rationale:** Single source of truth. When `DATABASE_URL` is set, it overrides the default local path. `TURSO_AUTH_TOKEN` is only required when the URL is a Turso remote URL.

### 3. Migrations run in GitHub Actions before Vercel deploy
**Rationale:** Failing migrations block the deploy, preventing production code from running against an unmigrated schema. The Action has direct access to GitHub secrets.

**Alternatives considered:**
- Run migrations during Vercel build. Rejected because build-time failures would still publish a failed deployment, and the build environment has limited tooling.
- Run migrations from a Vercel cron job or API route. Rejected because it adds a runtime endpoint and risk of concurrent migrations.

### 4. Vercel deployment via `vercel` CLI in the Action
**Rationale:** `npx vercel --prod --token` gives explicit control over when and how the deploy happens. The `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets point the CLI to the right project.

**Alternatives considered:**
- Use Vercel's native Git integration. Rejected because the user wants migrations to run first, which is easier to sequence in an Action.

### 5. Local `.env.local` stays unchanged
**Rationale:** Developers should not need Turso credentials for local work. Production values live in Vercel and GitHub secrets only.

## Risks / Trade-offs

- **First migration to empty Turso DB** → Existing `drizzle/` migrations are idempotent for new tables; the migration script tracks applied files in `__migrations`, so re-running is safe.
- **Secret misconfiguration blocks deploy** → This is desired behavior. Document the exact secrets needed.
- **Build-time env vars vs runtime env vars** → `DATABASE_URL` and `TURSO_AUTH_TOKEN` are only needed at runtime by the deployed functions, not during `next build`. They should be set in Vercel project settings, not necessarily in the GitHub Action unless needed for a build-time smoke test.
- **Local SQLite file excluded from production output** → `data/` is already in `.gitignore` and is not part of the build output; no extra change needed.

## Migration Plan

1. Create a Turso database and generate an auth token.
2. Create a Vercel project and link it to the GitHub repo.
3. Add runtime env vars to Vercel: `DATABASE_URL`, `TURSO_AUTH_TOKEN`, Clerk production keys.
4. Add GitHub repository secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
5. Update `lib/db/index.ts` and `scripts/migrate.ts` to use `DATABASE_URL`/`TURSO_AUTH_TOKEN` when present.
6. Add `.github/workflows/deploy.yml` with lint, type check, migrate, and deploy steps.
7. Push to `main` and verify the Action runs, migrations apply, and the deploy succeeds.

## Open Questions

None. The deployment approach and constraints are agreed.
