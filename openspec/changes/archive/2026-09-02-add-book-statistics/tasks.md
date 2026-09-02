## 1. Data layer

- [x] 1.1 Add `lib/statistics.ts` with `getReadingStats(ownerId, period)` returning `{ booksFinished, pagesRead, booksWithoutPageCount }`. Reuse `listBooks(ownerId, 'read')` from `lib/books.ts` and filter in-memory by `finished_at` prefix against the period.
- [x] 1.2 Add helpers for parsing the year/month out of `searchParams` and for normalizing invalid input back to current year / all months.

## 2. Locale strings

- [x] 2.1 Add a top-level `statistics` namespace to `lib/i18n/en.json` with `title`, `subtitle`, `period`, `year`, `month`, `allMonths`, `booksFinished` (+ `_plural`), `pagesRead`, `warningWithCount` (+ `_plural`), `empty`.
- [x] 2.2 Mirror the same namespace in `lib/i18n/es.json` with Spanish translations.

## 3. UI

- [x] 3.1 Create `app/components/statistics-cards.tsx` as a pure presentational component: two metric cards (`Books finished`, `Pages read`), the page-count warning banner, and the empty-state slot. Accepts the aggregator output plus dictionary helpers.
- [x] 3.2 Create `app/stats/page.tsx`: server component that calls `requireAppUser()`, resolves the period from `searchParams`, calls `getReadingStats`, and renders `<PageTitle>`, `<PageSubtitle>`, the period switcher, and `<StatisticsCards>`.

## 4. Navigation

- [x] 4.1 Insert a `Statistics` entry between `Shelf` and `Friends` in `app/components/side-nav.tsx` so the link is visible to signed-in owners on every page that shows the side nav.

## 5. Verify

- [x] 5.1 Run `npm run lint` and confirm no new lint errors.
- [x] 5.2 Run `npm run build` to confirm the new route compiles and the dictionary changes type-check against `Dictionary = typeof en`.
