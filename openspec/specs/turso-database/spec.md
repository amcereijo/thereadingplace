## Purpose

Defines how the application connects to a database in production and development, using a hosted Turso database on Vercel while keeping local development on SQLite.

## Requirements

### Requirement: Production uses Turso
The system SHALL connect to a hosted Turso (libsql) database when running in the production environment on Vercel.

#### Scenario: Production environment variables present
- **WHEN** the application starts and `TURSO_DATABASE_URL` points to a Turso URL
- **THEN** the system connects to Turso using the provided URL and auth token
- **AND** the system does not attempt to use a local SQLite file

### Requirement: Prefer an explicit Turso database URL
The system SHALL prefer `TURSO_DATABASE_URL` over `DATABASE_URL` when resolving the production database connection, so that Vercel Marketplace integrations cannot silently override it with a per-deployment branch database.

#### Scenario: Vercel Turso integration injects a branch database URL
- **WHEN** `DATABASE_URL` is set to a Turso branch database URL matching the `dpl-*` pattern
- **AND** `TURSO_DATABASE_URL` is unset
- **THEN** the system SHALL raise an error and refuse to start

#### Scenario: Stable main database URL is configured
- **WHEN** `TURSO_DATABASE_URL` is set to the main Turso database URL
- **THEN** the system SHALL use it regardless of any other `DATABASE_URL` value

### Requirement: Local development uses SQLite
The system SHALL continue to use a local SQLite file when no Turso environment variables are configured.

#### Scenario: Local development with no Turso URL
- **WHEN** a developer runs the app without setting `DATABASE_URL`
- **THEN** the system uses the local SQLite file at `data/app.db`

### Requirement: Migrations target the active database
The system SHALL run database migrations against whichever database is configured by the environment variables.

#### Scenario: Migrate Turso database
- **WHEN** the migration script runs with `DATABASE_URL` set to a Turso URL
- **THEN** the migrations are applied to the Turso database

#### Scenario: Migrate local SQLite database
- **WHEN** the migration script runs without `DATABASE_URL`
- **THEN** the migrations are applied to the local SQLite file
