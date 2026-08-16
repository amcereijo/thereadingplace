## 1. External setup

- [ ] 1.1 Create a Turso database and generate an auth token.
- [ ] 1.2 Create a Vercel project linked to the GitHub repository.
- [ ] 1.3 Add Vercel runtime environment variables: `DATABASE_URL`, `TURSO_AUTH_TOKEN`, Clerk production keys.
- [ ] 1.4 Add GitHub repository secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## 2. Database connectivity

- [x] 2.1 Update `lib/db/index.ts` to use `DATABASE_URL` and `TURSO_AUTH_TOKEN` when present, falling back to local SQLite.
- [x] 2.2 Update `scripts/migrate.ts` to use `DATABASE_URL` and `TURSO_AUTH_TOKEN` when present, falling back to local SQLite.

## 3. Deployment pipeline

- [x] 3.1 Add `.github/workflows/deploy.yml` that runs lint, type checks, migrations, and deploys to Vercel on pushes to `main`.
- [x] 3.2 Verify the workflow syntax and that steps depend on each other correctly.

## 4. Documentation and validation

- [x] 4.1 Add deployment setup instructions to the README or a dedicated `DEPLOYMENT.md`.
- [ ] 4.2 Run a test push to `main` and confirm migrations apply and the Vercel deploy succeeds.
