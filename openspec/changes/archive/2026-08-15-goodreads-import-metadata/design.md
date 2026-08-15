## Context

The books table currently stores imported Goodreads data in the `note` field as concatenated text, making it difficult to query individual fields. The schema lacks a `dateAdded` column and has no flexible storage for extra metadata fields from the import.

## Goals / Non-Goals

**Goals:**
- Add `metadata` JSON column for flexible key-value storage
- Add `dateAdded` column to preserve original import date
- Ensure `finishedAt` is correctly populated from "Date Read"
- Migrate existing note-based metadata to the new structure

**Non-Goals:**
- Changing the core book model beyond metadata additions
- Backfilling historical data for existing books
- Modifying the UI to display metadata fields

## Decisions

### Decision: Metadata Storage Format
**Choice**: JSON text column with `Record<string, unknown>` type
**Rationale**: SQLite supports JSON natively, allows flexible key-value pairs without schema changes, and can be queried with JSON functions if needed later.
**Alternatives considered**:
- Separate metadata table: Over-normalized for this use case
- Multiple nullable columns: Would require schema changes for each new field

### Decision: Migration Strategy
**Choice**: Add columns with NULL defaults, no data backfill
**Rationale**: Existing books don't have Goodreads metadata, so NULL is appropriate. New imports will populate the fields.
**Alternatives considered**:
- Backfill from notes: Complex parsing, error-prone, low value

## Risks / Trade-offs

**Risk**: Large metadata objects could impact query performance
→ Mitigation: Keep metadata limited to imported fields, index only if needed later

**Risk**: Migration requires SQLite ALTER TABLE
→ Mitigation: Use Drizzle Kit generate/migrate workflow already in place