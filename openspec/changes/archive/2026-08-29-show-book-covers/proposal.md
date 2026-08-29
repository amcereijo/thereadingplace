## Why

The shelf view today shows every book as a flat text row, even when the Google Books typeahead has already stored a cover URL in `metadata.coverUrl`. A book list without covers feels like a spreadsheet; with covers, the shelf becomes scannable and recognizable. The data is already there for books added through the typeahead — we just don't render it. Manual-entry and Goodreads-import books are missing covers because those flows don't go through Google Books.

## What Changes

- Render `metadata.coverUrl` as a thumbnail on every book row across the owner's all-books view, owner status views (`/to-read`, `/reading`, `/read`, `/abandoned`), and friend shelf views (`/u/[username]`, `/u/[username]/[status]`). Thumb is always visible, not gated behind the existing `Show details` toggle.
- Render a cover thumb on `RecommendationRow` in the received and sent lists, using the coverUrl that lives on the referenced `books` row (looked up at render time by `bookId`).
- Introduce a small `<BookCover>` primitive in `app/components/ui.tsx` that wraps `next/image`, falls back to a localized placeholder on missing or broken URLs, and lazy-loads below the fold.
- Allow `next/image` to fetch from `books.google.com` and `lh3.googleusercontent.com` (Google Books thumbnails and cover crops are served from these hosts).
- Add a one-shot backfill script `scripts/backfill-covers.ts` that walks every `books` row without a `metadata.coverUrl`, calls the existing Google Books search by `title` (and `author` when present), and writes the first thumbnail into `metadata.coverUrl`. Script is idempotent and skips rows that already have a cover.
- Add localized alt text and a placeholder label to `lib/i18n/en.json` and `lib/i18n/es.json`.
- No schema change, no new column, no edit-form changes. Covers arrive via typeahead picks, the backfill script, or new books added through the typeahead.

## Capabilities

### New Capabilities

- `book-covers`: covers how the shelf and recommendation views display book cover thumbnails, where the cover URL is sourced from (`metadata.coverUrl`), what placeholder is shown when a cover is missing or fails to load, and the contract for the backfill script.

### Modified Capabilities

- `book-shelf`: the owner-facing and friend-facing book rows MUST display a cover thumbnail at the left of the row whenever `metadata.coverUrl` is present, and MUST fall back to a localized placeholder when it is absent or fails to load.
- `recommendations`: the `RecommendationRow` component SHALL display a cover thumbnail for the referenced book when one can be resolved from the linked `books` row, and SHALL fall back to a localized placeholder when no cover is resolvable.

## Impact

- `next.config.ts`: add `images.remotePatterns` for `books.google.com` and `lh3.googleusercontent.com` so `next/image` can fetch and optimize remote thumbnails.
- `app/components/ui.tsx`: add `<BookCover>` primitive (size, alt, placeholder).
- `app/components/book-list.tsx`: render `<BookCover>` on every row (owner + friend branches) before the title block.
- `app/components/recommendation-row.tsx` and `app/recommendations/page.tsx`: resolve `coverUrl` from the linked `books` row by `bookId` and pass it to `<BookCover>`. Recommendations without a resolvable cover show the placeholder.
- `lib/i18n/en.json` and `lib/i18n/es.json`: add `shelf.coverAlt` (e.g., "Cover of {title}") and `shelf.coverPlaceholder` (e.g., "No cover").
- `scripts/backfill-covers.ts`: new script. Idempotent. Reads `GOOGLE_BOOKS_API_KEY` from env. Limits to one Google Books search per row. Writes only when a thumbnail is returned.
- No `BookRecord` field change, no Drizzle migration, no new env vars.
- Privacy: cover requests go directly to Google's CDN. Acceptable for this app per current stance; revisit if a self-hosted proxy is wanted later.
