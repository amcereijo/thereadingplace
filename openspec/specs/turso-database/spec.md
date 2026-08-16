## Purpose

Defines how the application connects to a database in production and development, using a hosted Turso database on Vercel while keeping local development on SQLite.

## Requirements

### Requirement: Production uses Turso
The system SHALL connect to a hosted Turso (libsql) database when running in the production environment on Vercel.

#### Scenario: Production environment variables present
- **WHEN** the application starts and `DATABASE_URL` points to a Turso URL
- **THEN** the system connects to Turso using the provided URL and auth token
- **AND** the system does not attempt to use a local SQLite file

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
