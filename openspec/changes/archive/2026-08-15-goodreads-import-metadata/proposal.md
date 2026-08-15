## Why

The current Goodreads import stores extra data (author, ISBN, publisher, reviews) in the `note` field as plain text, which makes it difficult to query or display programmatically. Additionally, the "Date Added" field from Goodreads is not preserved, and we need a flexible way to store any additional metadata from the import without modifying the schema for each new field.

## What Changes

- Add `metadata` JSON column to books table for flexible key-value storage of imported data
- Add `dateAdded` column to books table to preserve the original "Date Added" date from Goodreads
- Update Goodreads import to store extra fields in `metadata` instead of concatenating into `note`
- Ensure `finishedAt` is correctly populated from "Date Read" field

## Capabilities

### Modified Capabilities

- `goodreads-import`: Update import logic to use new metadata field and dateAdded property

## Impact

- **Database**: Schema change requiring migration (new columns on books table)
- **Code**: Update `lib/db/schema.ts`, `lib/goodreads-import.ts`, `lib/books.ts`, `lib/types.ts`
- **Import**: Better data preservation for future integrations