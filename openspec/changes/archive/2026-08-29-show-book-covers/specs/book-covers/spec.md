## Purpose

Defines how book covers are sourced, displayed, and backfilled across the shelf and recommendation views. Covers live in the existing `metadata.coverUrl` field; the capability specifies when a cover is shown, what placeholder stands in when one is missing or broken, and the contract for the backfill script.

## ADDED Requirements

### Requirement: Cover URL is sourced from book metadata
The system SHALL treat `metadata.coverUrl` on a book record as the source of truth for the cover thumbnail. When the value is a non-empty HTTP or HTTPS URL, the system SHALL display that URL as the book's cover.

#### Scenario: Book has a coverUrl
- **WHEN** a book record has `metadata.coverUrl` set to a non-empty http or https URL
- **THEN** the system displays that URL as the cover thumbnail on every shelf and recommendation row that references the book

#### Scenario: Book has no coverUrl
- **WHEN** a book record has no `metadata.coverUrl` (null, empty, or missing)
- **THEN** the system displays the localized placeholder instead of an image

### Requirement: Cover placeholder when missing or broken
The system SHALL display a localized placeholder in place of the cover whenever `metadata.coverUrl` is missing or the image fails to load. The placeholder SHALL be a neutral book glyph with a localized label.

#### Scenario: Missing coverUrl
- **WHEN** a book row renders and the book has no `metadata.coverUrl`
- **THEN** the system shows the localized placeholder

#### Scenario: Cover URL fails to load
- **WHEN** a cover image errors during load
- **THEN** the system swaps to the localized placeholder in the same layout slot

### Requirement: Cover alt text is localized
The system SHALL provide a localized `alt` attribute for every rendered cover image, composed from the book's title.

#### Scenario: Cover has localized alt text
- **WHEN** a cover thumbnail is rendered
- **THEN** its `alt` attribute is the localized "Cover of {title}" string from the active locale

### Requirement: One-shot backfill script populates missing covers
The system SHALL provide `scripts/backfill-covers.ts`, an idempotent script that walks every `books` row without `metadata.coverUrl`, calls the existing Google Books search endpoint by `title` (and `author` when present), and writes the first returned thumbnail URL into `metadata.coverUrl`. The script SHALL skip rows that already have a cover URL and SHALL NOT modify any other field on the book.

#### Scenario: Backfill finds a cover
- **WHEN** the backfill script processes a book with no coverUrl and Google Books returns a thumbnail
- **THEN** the script writes that thumbnail URL into the book's `metadata.coverUrl`

#### Scenario: Backfill finds no cover
- **WHEN** the backfill script processes a book with no coverUrl and Google Books returns no thumbnail
- **THEN** the script leaves the row unchanged and moves on

#### Scenario: Backfill is idempotent
- **WHEN** the backfill script runs more than once
- **THEN** it does not overwrite or remove any existing `metadata.coverUrl`

### Requirement: Recommendations resolve covers from the linked book
For every recommendation row that references an existing `bookId`, the system SHALL resolve a cover URL by reading `metadata.coverUrl` from the linked `books` row at render time.

#### Scenario: Linked book has a cover
- **WHEN** a recommendation references a `bookId` whose `books` row has `metadata.coverUrl`
- **THEN** the recommendation row shows that cover thumbnail

#### Scenario: Linked book has no cover or no link
- **WHEN** a recommendation either has no `bookId` or references a book without `metadata.coverUrl`
- **THEN** the recommendation row shows the localized placeholder
