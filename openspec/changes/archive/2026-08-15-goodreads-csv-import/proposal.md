## Why

Users migrating from Goodreads need an efficient way to import their existing reading history and book data into The Reading Place. Currently, users must manually re-enter all their book information, which is time-consuming and error-prone. This feature enables seamless migration from Goodreads by parsing their CSV export format.

## What Changes

- Add CSV parsing functionality to handle Goodreads export format
- Map Goodreads data fields to The Reading Place's book schema
- Create import workflow that validates and deduplicates books
- Provide user feedback during import process (success/error counts)

## Capabilities

### New Capabilities

- `goodreads-import`: Handles parsing of Goodreads CSV exports, mapping book metadata (title, author, rating, dates, reviews) to the application's data model

### Modified Capabilities

None - this is a new feature addition.

## Impact

- **Code**: New CSV parser module, import API endpoint/UI component
- **Dependencies**: May require CSV parsing library (e.g., PapaParse)
- **Data**: Temporary processing of user-uploaded CSV files
- **UX**: New import flow in user settings or book management