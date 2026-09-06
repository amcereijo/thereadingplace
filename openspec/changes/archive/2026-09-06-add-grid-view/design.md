## Context

The shelf currently renders as a single vertical list of rows in `app/components/book-list.tsx` (407 lines). It's used in 6 places: `/`, `/reading`, `/to-read`, `/read`, `/abandoned`, and friend profile pages (`/u/[username]`, `/u/[username]/[status]`). Today, row expansion is inline (`expandedId` state, expand panel at `book-list.tsx:293-396`). There is already one inline modal precedent in `app/components/change-status-button.tsx:50` (fixed overlay + backdrop click) but no shared `Modal` primitive.

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Add a grid view to `BookList` with viewport-adaptive columns.
- Persist view-mode choice per device via `localStorage` under `shelf.viewMode`.
- Ship with no new dependencies, no new component files, no breaking changes for list-mode users.

**Non-Goals:**
- Extracting a shared `<Modal>` primitive (defer until a third use case appears).
- Splitting `book-list.tsx` into multiple files.
- Persisting sort selection (only `viewMode` for now).
- Open/close animations on the modal.
- Per-status date customization (reuse existing `lastMeaningfulDate` from `book-list.tsx:125`).

## Decisions

### Single file, `viewMode` branch
Keep all logic in `book-list.tsx`. Branch on `viewMode === "list" | "grid"` after the sort logic. List-mode JSX stays byte-identical (no regression). The expanded details `<dl>` block is lifted into a local `BookDetails` helper inside the same file, used by both list-expansion and grid-modal.

**Alternative considered:** Split into `book-row.tsx` + `book-grid-card.tsx` + `book-modal.tsx`. Rejected for the easiest version; revisit if the file grows past ~600 lines.

### Viewport-adaptive grid via CSS Grid `auto-fill`
Use a single class:
```
grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4
```
At ~160px min cell width this gives 2 cols on phones, 3–4 on tablets, 5–6 on desktop, and more on ultrawide. No breakpoints to maintain.

**Alternative considered:** Tailwind responsive `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`. Rejected — more breakpoints, more ways to drift.

### `localStorage` persistence + SSR-safe hook
Add a `useViewMode` hook:
```ts
function useViewMode(): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>("list"); // SSR + first client render
  useEffect(() => {
    const stored = window.localStorage.getItem("shelf.viewMode");
    if (stored === "list" || stored === "grid") setMode(stored);
  }, []);
  const update = (m: ViewMode) => {
    setMode(m);
    window.localStorage.setItem("shelf.viewMode", m);
  };
  return [mode, update];
}
```
First paint is always `list` (matches existing behavior, no hydration mismatch). Stored value is applied on mount. Worst case: one frame of flicker for returning grid users.

**Alternative considered:** Cookie-based persistence via `next/headers` + server action. Rejected for the easiest version — adds round-trips and a server route for a UI-only preference.

### Modal pattern: copy `change-status-button.tsx`
Reuse the exact overlay markup (`fixed inset-0 z-50` backdrop + centered panel + backdrop-click-to-close). Add an `Esc` keydown listener scoped to the modal-open state. No visible ✕ button — matches existing UX.

**Alternative considered:** Native `<dialog>` element with `showModal()`. Rejected — diverges from the established pattern and would still need a backdrop-click + Esc handler (which `<dialog>` does give you, but introduces a new mental model in the codebase).

### Cover rendering via existing `BookCover`
Reuse `<BookCover>` with width/height props (`192×288` in grid; current default is `48×64` in list). Same placeholder fallback. No new image logic.

### Action buttons live in the modal, not the card
Grid cards display only cover/title/author/status/date. All action buttons (change status, edit, recommend, delete / add-to-shelf) live inside the modal. This keeps the card layout stable regardless of viewer permissions and avoids nested buttons / hover-only affordances.

### New i18n keys
Add two aria-label keys to both `lib/i18n/en.json` and `lib/i18n/es.json` under `shelf`:
- `viewGridAria` — "Switch to grid view" / "Cambiar a vista de cuadrícula"
- `viewListAria` — "Switch to list view" / "Cambiar a vista de lista"

No other copy changes; modal content reuses existing `seeMore`, `changeStatus`, `edit`, `delete`, etc.

## Risks / Trade-offs

- **[One-frame flicker on grid load]** → acceptable for a UI-only preference; revisit with cookie persistence if it becomes a complaint.
- **[Grid card click target is large on touch]** → intentional; the whole card is the affordance, mirroring Netflix/Goodreads grid conventions.
- **[Modal blocks the shelf while open]** → matches the existing `change-status-button` UX; users expect it. No background-scroll lock needed for the easiest version.
- **[localStorage not available in private mode]** → `useViewMode` already defaults to `"list"` on any read/write error; no app breakage.
- **[Screen reader announces cover image on every grid card]** → already true for list rows; `alt` text comes from existing `BookCover` (`shelf.coverAlt`). No change.

## Migration Plan

Pure front-end change. Deploy = `next build` + push. No DB migrations, no env changes, no feature flag needed (toggle is per-device, no shared rollout concern). Rollback = revert the commit; `localStorage` keys left behind are inert.

## Open Questions

None — all decisions resolved during exploration with the user.