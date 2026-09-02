## Context

The Reading Place already stores everything needed to compute finished-book counts and total pages: `books.status`, `books.finished_at`, and `books.metadata_json.pageCount` are all populated by existing flows (status changes, manual date entry, Goodreads import, Google Books search). The locale system in `lib/i18n/{en,es}.json` already provides the plural-aware `t()` helper used by every other page. The side nav (`app/components/side-nav.tsx`) renders items from a small config-like array, so adding a new link is a one-line edit.

What this change adds is a thin read-only aggregation layer plus a new RSC route that consumes it.

## Goals / Non-Goals

**Goals:**
- Owner-only statistics page that reads finished-book data and aggregates it in-memory; no schema changes.
- Locale-aware UI that matches the existing Card / PageTitle / Button styling.
- Period URL-driven so deep links and back-button work.
- A warning that nudges the owner to fill missing page counts.

**Non-Goals:**
- Charts, graphs, or visualizations.
- Tracking reading sessions, average time-to-read, or any duration metric.
- Friend-visible statistics.
- Caching layer or background re-aggregation — owner-local data, computed on each request.
- Editing page counts from the statistics page itself; the warning copy invites the owner to do so elsewhere, not from this route.

## Decisions

### 1. Aggregate in-memory from `listBooks(ownerId, 'read')`

Reuse `listBooks` (`lib/books.ts:90`) to fetch only `status = 'read'` rows, then filter and aggregate in TypeScript. Reasons:
- The existing function already returns `BookRecord` with parsed metadata, so we skip writing a parallel SQL parser.
- The `books` table is owner-scoped and small enough (hundreds to a few thousand rows for an active reader) that a single in-memory pass is fine for a page that loads once per navigation.
- Keeps the new code aligned with how `lib/recommendations.ts` and other modules consume the data layer.

**Alternative considered:** push the aggregation into SQL using `LIKE 'YYYY%'` and `LIKE 'YYYY-MM%'` predicates on `finished_at`. Cleaner for very large libraries, but `lib/books.ts` consistently materializes rows before exposing them, and following that convention keeps the change small and the test surface predictable.

### 2. Period from URL search params, not from cookies or DB

Read `?year=YYYY&month=MM` from `searchParams` in `app/stats/page.tsx`. Defaults: `year = currentYear`, `month = undefined` (all months in that year). Reasons:
- Deep links and the back button just work.
- No new state to sync with the locale cookie or Clerk session.
- Matches the pattern already used by `app/page.tsx` (`status` from search params).

### 3. Bucket key by string prefix, not Date math

Compare `book.finishedAt.slice(0, 4) === year` for year view, `book.finishedAt.slice(0, 7) === `${year}-${month}`` for month view. Reasons:
- `finished_at` is stored as `YYYY-MM-DD` text in SQLite; string compare is exact, fast, and avoids any timezone drift.
- We never need a "books finished on 2024-01-31 in the user's timezone" interpretation — `finished_at` is a date typed by the owner.

**Alternative considered:** parse both sides to `Date` and compare. More flexible but introduces locale/timezone risk with zero benefit since the storage format is already a calendar date.

### 4. PageCount extracted once per row

Walk each `BookRecord.metadata` and treat `pageCount` as a number when it's a finite `Number > 0`. Reasons:
- Mirrors how `parseMetadata` already returns a loose `Record<string, unknown>`.
- Lets the aggregator silently skip books whose page count is missing, null, zero, or a string ("—" from a sloppy import), which is exactly what the spec requires.

### 5. Side nav edit is a config change

`app/components/side-nav.tsx` builds `items` from a literal array in `buildItems`. Inserting `{ href: "/stats", label: dictionary.statistics.title, isActive: pathname.startsWith("/stats") }` between Shelf and Friends is a single-entry edit. No new props, no new badge logic.

### 6. New `statistics` namespace in both dictionaries

Add a top-level `"statistics": { ... }` block to both `en.json` and `es.json` with keys:
- `title` — page heading
- `subtitle` — page sub-heading
- `period` — label for the period switcher
- `year` / `month` — switcher axis labels
- `allMonths` — option meaning "all months in this year"
- `booksFinished` — metric label (plural-aware: `booksFinished` / `booksFinished_plural`)
- `pagesRead` — metric label
- `warningWithCount` — warning copy with `{count}` placeholder and `_plural` form
- `empty` — empty-state copy

Reason: keeps the change locale-aware without inventing a parallel translation system.

## Risks / Trade-offs

- **Sparse data on pages-read total.** Manually-added books with no page count will make `pagesRead` look low. → Mitigation: the page-count warning explicitly tells the owner how many books are missing and invites them to fill it in, surfacing the gap as a call to action rather than hiding it.
- **Books with `status = 'read'` and no `finished_at` are silently excluded.** A book marked read without a finished date won't appear in any period. → Mitigation: documented in the spec; the empty state covers periods with no qualifying books, so the user knows the page is not buggy.
- **In-memory aggregation scales with library size.** Fine for an individual user, but if the platform ever pivots to large multi-tenant libraries this becomes a SQL-bound problem. → Mitigation: keep `getReadingStats` behind a single function so the implementation can be swapped to SQL without changing call sites.
- **No validation that `year` query param is a real year.** Bad input (`?year=banana`) currently falls back to current year; this is acceptable but not enforced. → Mitigation: a `Number.isInteger` check in the page handler returns the current year as the safe fallback.
- **Side nav item is unconditional.** No badge logic. → Mitigation: there is no count to show; the spec does not call for one.

## Migration Plan

No migration. The change is additive:
- New files: `app/stats/page.tsx`, `app/components/statistics-cards.tsx`, `lib/statistics.ts`, plus the spec file under `openspec/changes/add-book-statistics/`.
- Edited files: `app/components/side-nav.tsx` (one new nav entry), `lib/i18n/en.json` and `lib/i18n/es.json` (one new namespace each).
- No schema changes, no migration script, no rollback plan beyond reverting the commit.

## Open Questions

None. The deferred decisions (charts, time-to-read, friend visibility, sessions) were resolved in the conversation that produced the proposal: explicitly out of scope for v1.

