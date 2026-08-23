## Why

The owner's shelf view currently renders every book card with its full metadata visible by default (formats, all four dates, and the note), making each card tall and hard to scan when there are many books. Owners need a denser, scannable list that surfaces only what matters for quick triage (title, author, status, last meaningful date, and the existing row actions) and lets them open full details only when they want them.

## What Changes

- Collapse the owner-facing book card so the visible row shows only: title + author, status badge, the single most recent meaningful date (`finished_at`, else `started_at`, else `abandoned_at`, else `date_added`), and the existing row actions (Change status, Edit, Recommend, Delete).
- Remove the always-visible formats line, all-four-dates line, and the inline note preview from the default card state.
- Add a `Show details` icon-only toggle button on the owner card that opens a `<details>`-style disclosure of the previously always-visible data: full formats, every meaningful date with its localized label, the note (if any), and any imported metadata. Toggling again collapses it back.
- Keep the friend-facing `details` toggle and the existing `Recommend` panel unchanged; the new toggle is additive on the owner row.
- Localize the new toggle's label, `aria-label`, and "show less" state through the existing `shelf` dictionary in both `en` and `es`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `book-shelf`: The owner-facing card on the all-books view and on each owner status view (`/`, `/to-read`, `/reading`, `/read`, `/abandoned`) MUST collapse non-essential data into a disclosure, surface a single "last meaningful date", and expose an icon-only `Show details` toggle whose disclosure reveals formats, all dates, the note, and metadata.

## Impact

- `app/components/book-list.tsx`: rewrite the owner branch of each card to render the compact row plus a new disclosure block; keep the friend and friend-view branches untouched.
- `lib/i18n/en.json` and `lib/i18n/es.json`: add `shelf.showDetails`, `shelf.showDetailsAria` (and reuse `shelf.showLess` / `shelf.showLessAria` for the open state).
- No database, action, or API changes. No `BookRecord` field changes. No changes to the friend shelf, recommendations, or icon-system capabilities beyond reusing existing icons (`ChevronDown`/`ChevronUp`).
- No accessibility regression: the new toggle is a `<button>` with a localized `aria-label` and the disclosure content remains keyboard reachable.
