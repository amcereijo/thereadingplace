## Context

`app/components/book-list.tsx` renders the owner's all-books and status-filtered shelf views. Today, each card is laid out in a single flex row plus an inline note preview and a four-element metadata line (`Añadido · Empezado · Terminado · Abandonado`) followed by a formats line. See `openspec/specs/book-shelf/spec.md` for the full requirements; the change in scope is the "Own-shelf views" requirement plus the new compact card requirement defined in this change.

The card already supports a `expandedId` state and an `expanded` block that the **friend** view uses to show full details; the owner view never sets that state. We will reuse that exact machinery for the owner card by allowing the owner branch to participate in `expandedId` toggling.

## Goals / Non-Goals

**Goals:**

- Make every owner shelf card scan as a single dense row.
- Reuse the existing `expandedId` toggle mechanism and the existing `expanded` disclosure block so we do not duplicate the rendering logic that the friend view already exercises.
- Stay inside the existing icon-system primitive (`<IconButton>`) so the new toggle matches the rest of the row.
- Keep keyboard reachability of the disclosure content (no `hidden` collapse).

**Non-Goals:**

- No changes to `BookRecord`, the database, server actions, or the friend shelf view.
- No new icon library imports.
- No change to the `Recommend` panel or its trigger.

## Decisions

### Decision 1: Reuse the existing `expandedId` state instead of per-card state
- **Rationale:** `BookList` already manages `expandedId` for the friend view's details toggle. Letting the owner branch read/write the same state keeps a single source of truth (only one card open at a time) and avoids duplicating the disclosure rendering that the friend view already proves works.
- **Alternatives considered:** Per-card `useState`. Rejected because it would let multiple cards open simultaneously and forces two copies of the disclosure markup to stay in sync.

### Decision 2: Compute the "last meaningful date" inline per book
- **Rationale:** Order is fixed by domain meaning: `finished_at` → `started_at` → `abandoned_at` → `date_added`. The first non-null value wins, paired with its localized label (`shelf.finishedOn`, `shelf.startedOn`, `shelf.abandonedOn`, `shelf.addedOn`).
- **Alternatives considered:** A new server field or a derived column. Rejected because the precedence rule is a pure presentation concern and the data already exists on the row.

### Decision 3: Render the disclosure with the same `<dl>` markup as the friend view's expanded block
- **Rationale:** Avoids divergence. Both audiences see the same five labeled fields, note, and metadata block, so we keep a single JSX subtree (`{expanded ? <OwnerDetails /> : null}`) — the friend branch already builds that subtree in `book-list.tsx` lines 222–308 and we will lift it into a small inline `OwnerDetails` (or reuse the same JSX, gated on `editable`) so the owner gets identical content when toggled open.
- **Alternatives considered:** A new `<BookDetails />` component. Skipped — the disclosure is local to this view and extracting a component would not pay off yet.

### Decision 4: Use the existing `<IconButton>` with `ChevronDown` / `ChevronUp`
- **Rationale:** The icon-system spec already mandates a single library (`lucide-react`) and a square `IconButton` primitive with localized `aria-label`. The friend view already imports `ChevronDown`/`ChevronUp` for its details toggle, so we add no new icons.
- **Alternatives considered:** A `<details>/<summary>` element. Rejected because `summary` is hard to style as an icon-only button matching the row, and it ships its own built-in disclosure semantics we already re-implement with state.

### Decision 5: Add `shelf.showDetails` + `shelf.showDetailsAria` to both locale dictionaries
- **Rationale:** The friend view reuses `shelf.details` / `shelf.showLess`; the owner view will mirror that pattern with the new keys to keep the strings consistent across locales and avoid breaking the friend view.
- **Alternatives considered:** Reuse `shelf.details` for both. Rejected because the friend label and the owner label are conceptually different surfaces ("Details" for a friend's view vs. "Show details" for the owner row) and translators may want different wording.

## Risks / Trade-offs

- [Two cards open briefly during state transition] → Already mitigated by `expandedId` (single value).
- [Owner loses visibility of formats/dates/note by default] → Mitigation: a discoverable icon-only toggle is rendered on every card, so one click reveals the full disclosure.
- [Toggle label drift across locales] → Mitigation: add the new keys to both `en.json` and `es.json` in the same change.
- [Disclosure height jumps when opened] → Acceptable; matches the existing friend view behavior, and the user just asked for the card to start compact.

## Migration Plan

No data migration. Deploy the component change behind the same routes the friend view already exercises. Rollback is a single revert of `app/components/book-list.tsx` and the two locale files.

## Open Questions

None.
