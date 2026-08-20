## Why

Today, adding a book means typing the title and author by hand. Most readers already have a clear mental picture of the book they want to add, and Google Books already knows its title, author, ISBN, publisher, page count, and a cover thumbnail. Surfacing those fields as one-click suggestions makes the "Add a book" form faster and less error-prone, while keeping manual entry as the default for anything Google Books can't find.

## What Changes

- New server-side Google Books lookup endpoint (`GET /api/books/search?q=…`) called from the "Add a book" form.
- New typeahead UI inside the "Add a book" form that debounces the user's title input, fetches matches, and lets the user pick one with the keyboard or mouse.
- Selecting a match prefills the form's title and author, and stores extra metadata (cover URL, ISBN-10/13, publisher, page count, published date, description, categories, average rating, Google Books volume id) into the existing `metadata` JSON field on the book record.
- Multiple authors from Google Books are joined with `", "` and stored in the existing single-string `author` field — no schema change.
- Manual entry stays fully supported: typing without selecting a match submits whatever the user typed.
- The lookup is locale-aware: it biases results using Google Books' `langRestrict` based on the active user locale (`en` or `es`).
- If Google Books is unreachable, returns zero results, or errors, the form continues to work — the typeahead simply hides or shows an empty state.

## Capabilities

### New Capabilities

- `book-search`: lets a signed-in user search Google Books by title while creating a book, select a match, and have the form prefilled with title, author, and stored metadata.

### Modified Capabilities

- (none — no existing capability's requirements change. The `books` and `book-shelf` specs remain valid because the `metadata` field already supports arbitrary key/value extras, mirroring the Goodreads import pattern.)

## Impact

- New code: `lib/google-books.ts`, `app/api/books/search/route.ts`, `app/components/book-search.tsx`, plus a small change to `app/components/create-book-form.tsx` to render the typeahead and forward selections into the existing `BookForm`.
- New dependency: none — Google Books Volumes API works over plain HTTPS.
- New env var: `GOOGLE_BOOKS_API_KEY` (server-side). Google Books requires an API key on every request, even public-data searches. The key is read from `process.env.GOOGLE_BOOKS_API_KEY` inside the route handler and passed as `?key=…` on the outbound fetch. No key in the bundle, no key sent to the client.
- Schema: unchanged. `metadata: Record<string, unknown>` already exists on `books` and accepts arbitrary JSON.
- i18n: new strings (loading state, "no results", error message) added to `lib/i18n/en.json` and `lib/i18n/es.json`.
- Caching: route handler response is server-cached for 1 hour per query; per-volume metadata is preserved for reuse if a user picks the same result twice.
