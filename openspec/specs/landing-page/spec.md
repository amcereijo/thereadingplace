## Purpose

Provides a public entry point for visitors who are not signed in, explaining the application and inviting them to sign up or sign in.

## Requirements

### Requirement: Public landing page on home route
The system SHALL display a public landing page when a visitor opens the home route (`/`) without being signed in.

#### Scenario: Signed-out visitor opens home
- **WHEN** a visitor who is not signed in navigates to `/`
- **THEN** the system displays the landing page
- **AND** the landing page includes a short description of the app
- **AND** the landing page provides links or buttons to sign up and sign in

### Requirement: Landing page does not expose personal data
The system SHALL NOT display any user's books, shelves, or personal information on the landing page.

#### Scenario: Public landing has no shelf data
- **WHEN** a signed-out visitor views the landing page
- **THEN** the system does not query or display any book records
