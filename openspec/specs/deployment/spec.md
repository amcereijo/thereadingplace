## Purpose

Defines how the application is deployed to production from the GitHub repository, including the continuous deployment pipeline, required external services, and secret configuration.

## Requirements

### Requirement: Deploy on merge to main
The system SHALL deploy the production application automatically when code is merged or pushed to the `main` branch.

#### Scenario: Push to main triggers deployment
- **WHEN** a commit is pushed to the `main` branch
- **THEN** a GitHub Actions workflow runs lint and type checks
- **AND** the workflow applies database migrations
- **AND** the workflow deploys the application to Vercel production

### Requirement: Fail deployment if checks fail
The system SHALL NOT deploy if lint, type checks, or database migrations fail.

#### Scenario: Migration failure blocks deploy
- **WHEN** the deployment workflow runs and a migration fails
- **THEN** the workflow stops before deploying to Vercel

### Requirement: Production secrets are required
The system SHALL require specific secrets to be configured in GitHub and Vercel before deployment can succeed.

#### Scenario: Missing database credentials fail migration
- **WHEN** the deployment workflow runs without Turso database credentials
- **THEN** the migration step fails
