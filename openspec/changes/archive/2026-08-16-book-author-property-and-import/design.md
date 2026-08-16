## Context

See `proposal.md` for motivation. The current `BookRecord` type has no `author` field; the database `books` table stores only `title`, `note`, and a JSON `metadata_json` blob. Goodreads import currently writes the parsed "Author" CSV value into `metadataJson.author`. Shelf list views render only the book title and metadata panel. This design adds a first-class `author` field, exposes it in the manual-entry UI, renders it next to the title in lists, and routes the Goodreads "Author" column into that field.

## Goals / Non-Goals

**Goals:**
- Add an optional `author` property to the book data model and database.
- Allow users to add and edit an author when manually creating or updating a book.
- Display the author alongside the title in every shelf list view when present.
- Store Goodreads "Author" imports in the new `author` field, not in `metadata`.
- Keep existing `metadata.author` records intact unless the user edits or re-imports them.

**Non-Goals:**
- Migrating historical `metadata.author` values automatically.
- Changing duplicate detection (it already receives `author` from the parser; it does not currently use it in the query).
- Author disambiguation, multiple authors, or structured author objects (e.g., first/last name).

## Decisions

### 1. Add an `author` text column to the `books` table
**Rationale:** A first-class column makes the author queryable and displayable without JSON parsing. SQLite's lightweight migrations keep this simple.

**Alternatives considered:**
- Keep author in `metadataJson` and add a separate display preference. Rejected because the user explicitly wants a new property, not metadata.

### 2. Update `BookRecord`, `createBook`, `updateBook`, and `copyBook` to include `author`
**Rationale:** The author becomes a peer of `title` across the persistence layer. `copyBook` copies the source author's name so the copied book is self-contained.

### 3. Add an author input to the shared `BookForm` component
**Rationale:** Both `CreateBookForm` and `EditBookForm` use `BookForm`, so a single change covers manual add and edit flows.

### 4. Render author next to title in `BookList`
**Rationale:** The spec requires "always shown along the title in list view". Rendering it on the same line (e.g., "Title by Author") is the minimal, consistent change across all status and friend views.

### 5. Pass `author` from `ParsedBook` into the new DB column in `importBooks`
**Rationale:** The parser already extracts `author`. We stop writing `author` to `metadataJson` and insert it into the new `author` column instead. Other Goodreads-specific fields remain in `metadata`.

## Risks / Trade-offs

- **Existing imported books keep `author` in metadata** → Not a functional risk; they remain readable and can be edited manually if needed. A future migration could backfill them.
- **Friend-copied books inherit the original author** → Desired; the copied record should be self-contained.
- **Whitespace-only author values** → Treat as null on both client and server to avoid empty "by" labels.

## Migration Plan

1. Add `author` column to `lib/db/schema.ts`.
2. Generate and run the Drizzle migration for the local SQLite database.
3. Update application code (types, persistence, forms, server actions, import).
4. Verify existing tests/smoke scripts pass and add a migration note if the production DB exists.

## Open Questions

None. The user request is specific enough to proceed.
