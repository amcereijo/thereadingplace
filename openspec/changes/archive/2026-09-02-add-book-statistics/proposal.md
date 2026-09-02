## Why

The Reading Place tracks individual books but offers no aggregate view of a person's reading activity. Owners can see how many books are on each shelf, but not how many they finished this year or how many pages they read. Adding a small statistics section gives them a year/month rollup of books finished and pages read, with a nudge to fill in missing page counts so the totals stay accurate.

## What Changes

- Add a new `/stats` page that shows, for a selected year or month:
  - the number of books the owner finished in that period, and
  - the total pages they read in that period across finished books that have a page count.
- Add a period switcher on the page: choose a year, and optionally drill into a month.
- Add a "Statistics" entry to the owner-facing side nav, between Shelf and Friends.
- Surface a warning when finished books in the selected period lack a `metadata.pageCount`, so the owner can fill the gap to make totals more accurate.
- Add new localized strings to both `en.json` and `es.json` for the page title, switcher labels, metric labels, warning copy, and empty state.
- Add `lib/statistics.ts` with a single aggregation helper that derives the metrics from the existing `books` rows; no schema changes, no new dependencies.

## Capabilities

### New Capabilities
- `book-statistics`: owner-facing statistics page that aggregates finished books into year/month buckets and reports counts and total pages.

### Modified Capabilities
- (none)

## Impact

- **New code**:
  - `app/stats/page.tsx` — RSC that resolves the user, reads the period from search params, calls the aggregator, and renders the metric cards + warning.
  - `app/components/statistics-cards.tsx` — pure presentational component for the two metric cards and warning banner.
  - `lib/statistics.ts` — `getReadingStats(ownerId, period)` returning `{ booksFinished, pagesRead, booksWithoutPageCount }`.
- **Modified files**:
  - `app/components/side-nav.tsx` — add a "Statistics" link between Shelf and Friends.
  - `lib/i18n/en.json`, `lib/i18n/es.json` — add new keys under a new `statistics` namespace.
  - `lib/i18n/types` consumers — no changes needed; the dictionary is `typeof en` and both files stay in sync.
- **Data**: read-only against the existing `books` table. The query path stays `status = 'read' AND finished_at IS NOT NULL`; no migration needed.
- **No breaking changes**, no API surface changes, no new dependencies.
