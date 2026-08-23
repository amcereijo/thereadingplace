## Why

The friend shelf view (`/u/<username>`) still renders each book card in the tall pre-compact layout: a formats line, a four-date line, and an inline note preview. The owner's shelf was already collapsed into a compact single-row card by the `compact-book-list-items` change, so the two views now feel visibly inconsistent and friends have to scroll through the same row height owners no longer see. Friends should get the same compact card surface owners do.

## What Changes

- Collapse the friend-facing book card so the visible row shows only: title + author (when present), status badge, the single most recent meaningful date (`finished_at` → `started_at` → `abandoned_at` → `date_added`) prefixed with its localized label, and the existing icon-only row actions (`Details`, `Add to my shelf`).
- Remove the always-visible formats line, the four-date line (no labels), and the inline note preview from the default friend card state.
- Keep the existing `Details` icon-only toggle on the friend card: it continues to open the same disclosure already used today (formats, every date with its localized label, the note when present, metadata), and toggling again collapses it.
- Reuse the existing `shelf.addedOn` / `shelf.startedOn` / `shelf.finishedOn` / `shelf.abandonedOn` templates and the existing `Details` / `Show less` / `detailsAria` / `showLessAria` keys — no new locale strings required, since the owner compact card and the friend compact card share the same vocabulary and the labels are already in `en.json` and `es.json`.
- The owner's compact card and the recommendation / change-status / edit / delete actions on the owner's card stay exactly as they are; this change only touches the friend branch.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `friendships`: The friend-facing book card on the friend's all-books view and each friend status view MUST collapse non-essential data into a disclosure and surface a single "last meaningful date" with its localized label, mirroring the owner-facing compact card from `book-shelf`. The existing `Details` icon-only toggle remains the entry point to formats, every date with its localized label, the note, and metadata; the existing `Add to my shelf` action is preserved.
- `book-shelf`: Clarify that the owner-facing compact card and the friend-facing compact card share the same collapsed row shape (title+author, status badge, single labeled last-meaningful date, icon-only row actions) so future changes do not drift the two audiences apart again. The disclosure content for both audiences remains identical.

## Impact

- `app/components/book-list.tsx`: rewrite the friend (`friendView`) branch of each card body to drop the formats line, the four-date line, and the inline note preview; render a single `lastMeaningfulDate` line using the existing `shelf.*On` templates; reuse the existing `Details` / `Show less` `IconButton` toggle (no new icon imports). No changes to the existing `expanded` disclosure block.
- `lib/i18n/en.json` and `lib/i18n/es.json`: no changes — the keys this change reads (`shelf.finishedOn`, `shelf.startedOn`, `shelf.abandonedOn`, `shelf.addedOn`, `shelf.details`, `shelf.detailsAria`, `shelf.showLess`, `shelf.showLessAria`, `shelf.addToShelfAria`) already exist in both locales.
- No database, action, API, or `BookRecord` changes. No new dependencies. No icon-library additions.
- No accessibility regression: the existing `Details` toggle already has a localized `aria-label` and the disclosure content is already keyboard reachable.
