## Why

The shelf currently renders as a single vertical list of rows on every page (home, status shelves, friend profiles). Users with growing libraries have asked for a denser, more scannable view — a grid of book covers ("cuadricula") — that adapts column count to the device. Inline expansion in the list works for a few rows but inflates the page when a user wants to skim many covers at once.

## What Changes

- Add a **grid view mode** to the shelf that renders books as portrait-cover cards in a CSS Grid layout whose column count adapts to the viewport (`auto-fill` + `minmax(...)`).
- Add an **icon-only toggle** in the existing shelf toolbar (next to the sort select) that switches between list and grid. Lucide `LayoutGrid` and `List` icons, with localized aria-labels.
- **Persist the chosen view per device** in `localStorage` under the `shelf.viewMode` key. First-time visitors see the list; returning visitors see their last selection.
- **Replace the inline "See more" expansion** in the grid mode with an **inline modal** that shows the same details currently shown when expanding a list row, plus the action buttons (change status, edit, recommend, delete for the owner; details + add-to-shelf for friend view). The modal closes on backdrop click or `Esc`.
- **No new dependencies, no new component files**. All changes land in `app/components/book-list.tsx` and the i18n dictionaries. List-mode rendering stays byte-identical for users who don't toggle.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `book-shelf`: Add a requirement that the shelf MAY render in either list or grid view, controlled by a per-device toggle persisted in `localStorage`, with grid showing cover + title + author + status + status-relevant date in a viewport-adaptive grid and opening a modal on selection.

## Impact

- `app/components/book-list.tsx` — extended with `viewMode` state, `useViewMode` persistence hook, toolbar toggle, new grid branch, modal markup, lifted `BookDetails` helper. ~150 lines added.
- `lib/i18n/en.json`, `lib/i18n/es.json` — two new aria-label keys: `shelf.viewGridAria`, `shelf.viewListAria`.
- No backend, schema, or auth changes.
- No new dependencies; relies on Tailwind v4 grid utilities and existing Lucide icons.
- No breaking changes for existing list-view users.