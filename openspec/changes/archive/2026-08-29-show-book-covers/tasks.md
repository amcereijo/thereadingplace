## 1. Image config

- [x] 1.1 Add `images.remotePatterns` for `books.google.com` and `lh3.googleusercontent.com` in `next.config.ts`

## 2. Shared `<BookCover>` primitive

- [x] 2.1 Add `coverAlt` and `coverPlaceholder` strings to `lib/i18n/en.json` and `lib/i18n/es.json` under `shelf`
- [x] 2.2 Implement `<BookCover>` in `app/components/book-cover.tsx` (client component) taking `url`, `bookTitle`, `dictionary`, `className`; renders `next/image` with 48×64 box, `http://` → `https://` normalization, and `onError` swap to a localized placeholder using the `BookImage` icon from `lucide-react`

## 3. Shelf view rendering

- [x] 3.1 Update `app/components/book-list.tsx` owner branch to render `<BookCover>` before the title block on every card
- [x] 3.2 Update `app/components/book-list.tsx` friend branch to render `<BookCover>` before the title block on every card
- [x] 3.3 Verify the compact-row layout still reads cleanly on mobile (thumb at left, title block shrinks as expected)

## 4. Recommendations rendering

- [x] 4.1 Add a `listCoverUrlsByBookId` helper in `lib/books.ts` that returns `Map<bookId, coverUrl>` for a given list of bookIds, only including rows with a non-empty `metadata.coverUrl`
- [x] 4.2 Update `app/recommendations/page.tsx` to call the helper once with the union of referenced `bookId`s and pass the resolved `coverUrl` into each `RecommendationRow`
- [x] 4.3 Update `app/components/recommendation-row.tsx` to accept an optional `coverUrl` prop and render `<BookCover>` before the title

## 5. Backfill script

- [x] 5.1 Implement `scripts/backfill-covers.ts`: read all `books` rows, filter to those without `metadata.coverUrl`, call `searchVolumes` from `lib/google-books.ts` per row using `title` (and `author` when present), update `metadataJson` with the first thumbnail found, log progress
- [x] 5.2 Make the script idempotent (skip rows that already have `metadata.coverUrl` even if re-run)
- [x] 5.3 Add a `db:backfill-covers` npm script in `package.json`
- [x] 5.4 Document usage in the script's header comment (env var, sequential run, not safe for large datasets)
- [x] 5.5 Respect Google Books rate limit (~1 req/s): sleep between requests (default 1100 ms) and retry with exponential backoff on HTTP 429/503

## 6. Verification

- [x] 6.1 Manually verify a typeahead-added book shows its cover on the shelf
- [x] 6.2 Manually verify a manual-entry book shows the placeholder, then backfill, then the cover
- [x] 6.3 Manually verify a recommendation row shows the cover when its linked book has one and the placeholder otherwise
- [x] 6.4 Run `npm run lint` and `npm run build` to confirm no regressions
