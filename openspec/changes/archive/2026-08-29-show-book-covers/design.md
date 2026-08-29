## Context

The Google Books typeahead already stores `metadata.coverUrl` on `books` rows when a user picks a search result (`lib/google-books.ts:135-136`), but nothing renders it. `sharp` is already a devDependency (`package.json:33`), and `next/image` has no current consumers. `next.config.ts` is empty. Friend shelves and recommendation rows render `BookRecord` data without ever touching metadata. The Goodreads import stores ISBN13 but no cover; the manual-entry path stores no metadata at all.

## Goals / Non-Goals

**Goals:**
- Display the cover on every row that renders a book, owner and friend alike.
- Display the cover on recommendation rows by looking up the linked `books` row at render time.
- Reuse the existing Google Books search for backfill; do not duplicate the lookup logic.
- Keep the cover pipeline simple: URL only, no proxy, no storage. `next/image` does the resize/cache work at the edge.

**Non-Goals:**
- Self-hosting covers or proxying through our own storage.
- Wiring Open Library as a fallback (deferred — see proposal).
- Adding a "Find cover" button to the edit form (no edit-flow changes).
- Snapshotting `coverUrl` onto the `recommendations` table (per-render lookup is sufficient for now).

## Decisions

### Use `next/image` with `images.remotePatterns`, not a self-hosted proxy
Direct Google URLs keep the change schema-free and storage-free. `next/image` adds on-the-fly resize, WebP/AVIF, a responsive `srcset`, and an edge cache for the optimized variant. `sharp` is already a devDependency, so no new build dependency. Allowed remote hosts: `books.google.com` and `lh3.googleusercontent.com` (Google serves book thumbnails and resized crops from both). **Alternative considered**: self-host on Vercel Blob. Rejected for now — it adds storage cost and a CDN egress line without a clear win on a personal app, and we explicitly chose direct URLs in the proposal.

### Add a `<BookCover>` primitive in `app/components/ui.tsx`
Centralizes the placeholder fallback, alt text composition, and `next/image` sizing so every consumer renders identically. The primitive takes `url`, `alt`, and `bookTitle` (for placeholder label). It uses an `onError` swap to a placeholder element with the same dimensions. **Alternative considered**: inline `<Image>` at each call site. Rejected — the fallback and alt-text contract would be repeated and easy to drift.

### Per-render lookup for recommendations
`app/recommendations/page.tsx` already batches DB calls. Add one more call: for each recommendation that has a `bookId`, fetch `metadata.coverUrl` from the linked `books` row. Group the lookup by `bookId` to avoid N+1. **Alternative considered**: snapshot `coverUrl` onto the `recommendations` table at send time. Rejected — adds a migration and a redundant field, and the linked book row is already the canonical source. Per-render lookup is fine because `next/image` caches the optimized variant at the edge.

### Backfill script: server action via the existing search endpoint
`scripts/backfill-covers.ts` reuses `lib/google-books.ts` directly (same module the API route uses) so the search behavior, locale handling, and rate limiting stay in one place. Script reads `GOOGLE_BOOKS_API_KEY` from env. Limits to one search per row. Writes only when a thumbnail is found; never overwrites an existing `coverUrl`. **Alternative considered**: hit the `https://www.googleapis.com/books/v1/volumes` endpoint directly. Rejected — would duplicate `lib/google-books.ts` logic for no gain.

### Thumb size: 48×64 (3:4 aspect)
Fits the existing compact row register set by the "compact book list items" change. Object-cover with a fixed box absorbs Google Books' wildly varied thumbnail aspect ratios. Lazy-loads by default via `next/image`. **Alternative considered**: 64×96. Rejected — too tall for the compact owner row on mobile; 48×64 reads as "spine" rather than "cover" and matches how bookshelves are scanned in real life.

## Risks / Trade-offs

- **Google can rotate or remove cover URLs** → `next/image` will 404 and the `<BookCover>` primitive swaps to the placeholder. No broken-image icons ever rendered.
- **Reading list observable to Google** → every cover view pings `books.google.com`. Acceptable per current stance; if a privacy-conscious reader ever complains, we add a server-side fetch endpoint and migrate `coverUrl` to our own blob path. No client change.
- **Backfill API quota** → one Google Books request per missing row, sequential. For a personal app this is fine. For a multi-tenant app we'd want batching and rate limiting. Document this in the script's comments.
- **Per-render lookup on recommendations adds one DB query per page load** → mitigated by grouping `bookId`s and reading in a single `WHERE bookId IN (...)` query, mirroring the `listUsernamesById` pattern already in `app/recommendations/page.tsx`.
- **Aspect ratio variance** → Google thumbnails arrive at unpredictable sizes. `object-cover` with a fixed 3:4 box prevents layout shift but can crop covers. Acceptable for a shelf view where scanning matters more than seeing the full art.

## Migration Plan

- Deploy code changes (`next.config.ts`, `app/components/ui.tsx`, `app/components/book-list.tsx`, `app/components/recommendation-row.tsx`, `app/recommendations/page.tsx`, i18n strings). No DB migration.
- Run `scripts/backfill-covers.ts` once after deploy. The script is idempotent and safe to re-run.
- No rollback story beyond reverting the deploy — covers are an additive display on top of existing data.
