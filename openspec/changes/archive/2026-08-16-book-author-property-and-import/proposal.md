## Why

Books currently lack a dedicated author property. Shelf list views only show the title, and Goodreads imports store the author in the generic `metadata` JSON blob instead of a first-class field. This makes it harder to browse books and impossible to rely on the author for duplicate detection or display.

## What Changes

- Add an optional `author` property to the book record.
- Allow the owner to enter an author when manually adding a book.
- Display the author alongside the title in all book list views (when present).
- Update Goodreads CSV import to write the "Author" CSV column into the new `author` field, not into `metadata`.

## Capabilities

### New Capabilities
- `books`: adds a first-class `author` property to book records and supports entering it during manual book creation.

### Modified Capabilities
- `goodreads-import`: changes the data-field mapping requirement so that the "Author" CSV column is stored in the book's `author` property instead of `metadata`.
- `book-shelf`: updates the shelf list-view requirements so the author is shown next to the title when available.

## Impact

- Book creation/editing UI and API schema.
- Shelf list views across all status filters and the all-books view.
- Goodreads CSV import parser and mapping logic.
- Existing imported books with an author in `metadata` are not affected; they will keep the old data unless re-imported or edited.
