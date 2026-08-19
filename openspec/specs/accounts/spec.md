## Purpose

Lets a person create an account, keep a signed-in session, and claim a unique username so they can own a shelf and be invited by others.

## Requirements

### Requirement: Anyone can create an account
The system SHALL allow an unauthenticated person to create an account and SHALL establish a signed-in session after successful signup.

#### Scenario: Successful signup
- **WHEN** an unauthenticated person completes signup
- **THEN** the system creates an account and signs them in

#### Scenario: Signup with an existing identity is rejected
- **WHEN** a person tries to sign up with an identity the system already recognizes
- **THEN** the system MUST NOT create a second account for that identity
- **AND** the system informs them that the identity is already in use

### Requirement: Signed-in session
The system SHALL keep a signed-in person authenticated across requests until they sign out.

#### Scenario: Signed-in person stays signed in
- **WHEN** a signed-in person returns to the app in the same session
- **THEN** the system treats them as authenticated without requiring signup again

#### Scenario: Sign out
- **WHEN** a signed-in person signs out
- **THEN** the system ends the session
- **AND** subsequent requests treat them as unauthenticated

### Requirement: Unique username
The system SHALL require each account to have exactly one unique username before the person can use the rest of the app. The username SHALL be unique among all accounts, compared case-insensitively. Error messages and instructions on the claim-username page SHALL be translated according to the active locale.

#### Scenario: Claim an unused username
- **WHEN** a signed-in person with no username submits an unused username
- **THEN** the system stores that username on their account

#### Scenario: Duplicate username is rejected
- **WHEN** a signed-in person submits a username that another account already has, differing only by letter case
- **THEN** the system MUST NOT store the username
- **AND** the system displays the error message in the active locale

#### Scenario: Username required before using the app
- **WHEN** a signed-in person has no username
- **THEN** the system MUST require them to choose a username before they can add books, send invites, or view shelves
- **AND** the prompt is shown in the active locale

### Requirement: Signed-out access
The system SHALL deny unauthenticated people access to any shelf, book, or friendship data.

#### Scenario: Signed-out person cannot see a shelf
- **WHEN** an unauthenticated person requests any shelf view
- **THEN** the system MUST NOT show book data
- **AND** the system prompts them to sign in using text in the active locale
