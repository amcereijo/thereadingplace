## 1. i18n

- [x] 1.1 Add `viewGridAria` and `viewListAria` keys under `shelf` in `lib/i18n/en.json`
- [x] 1.2 Add matching keys in `lib/i18n/es.json`

## 2. BookList refactor

- [x] 2.1 Lift the expanded `<dl>` block in `app/components/book-list.tsx` into a local `BookDetails` helper that takes `{ book, dictionary, formatDate }` and returns the same markup used today
- [x] 2.2 Replace the inline expanded panel in list mode with a call to `BookDetails` (no visual change for list users)

## 3. View-mode hook + persistence

- [x] 3.1 Add `useViewMode()` hook in `app/components/book-list.tsx` that defaults to `"list"`, reads `localStorage.getItem("shelf.viewMode")` on mount, and writes to `localStorage` on change
- [x] 3.2 Wire `[viewMode, setViewMode]` into the `BookList` component

## 4. Toolbar toggle

- [x] 4.1 Add two `IconButton`s (Lucide `LayoutGrid`, `List`) to the existing toolbar row in `app/components/book-list.tsx`, with `aria-label`s from the new i18n keys, after the sort selector
- [x] 4.2 Mark the active mode's button with `aria-pressed="true"` and a distinct visual variant

## 5. Grid branch

- [x] 5.1 Add a `viewMode === "grid"` render branch in `BookList` that returns a `<ul>` with `grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4`
- [x] 5.2 Add a `BookGridCard` sub-component inside the same file that renders cover (via `BookCover` with `width={192} height={288}`), title (clamp 2 lines), author (1 line, truncate), `StatusBadge`, and the date from `lastMeaningfulDate`
- [x] 5.3 Wire the whole card to a button (`<button type="button" aria-haspopup="dialog">`) that opens the modal for that book

## 6. Modal

- [x] 6.1 Add `modalBookId` state to `BookList`
- [x] 6.2 Render a modal (matching the `change-status-button.tsx` overlay pattern) when `modalBookId` is set, containing the `BookDetails` panel plus the actions row
- [x] 6.3 Branch the actions row on `editable` / `friendView`: owner sees change status / edit / recommend / delete; friend sees details + add-to-shelf only
- [x] 6.4 Close on backdrop click (`onClick` checks `e.target === e.currentTarget`)
- [x] 6.5 Close on `Esc` via a `keydown` listener scoped to the modal-open state

## 7. Verify

- [x] 7.1 `npm run lint` passes with no new errors
- [x] 7.2 `npm run build` passes
- [x] 7.3 Manual smoke: toggle persists across reload; modal opens/closes (backdrop + Esc); action buttons inside the modal still work (change status, edit, recommend, delete, add-to-shelf)
- [x] 7.4 Visual check at 360px, 1280px, 1920px viewport widths: grid columns adapt, covers aren't cropped, no horizontal scroll