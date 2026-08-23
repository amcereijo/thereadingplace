## Context

`app/components/book-list.tsx` is the single component used by both the owner's shelf views (`/`, `/to-read`, `/reading`, `/read`, `/abandoned`) and a friend's shelf views (`/u/<username>`, `/u/<username>/<status>`). The owner branch already renders a compact single-row card after `compact-book-list-items`: title + author, status badge, a single `lastMeaningfulDate` line (`Finished on …` / `Started on …` / `Abandoned on …` / `Added …`), the existing icon-only row actions, and an icon-only `Show details` toggle that reveals a `<dl>` disclosure (formats, every meaningful date with its localized label, note, metadata). See `openspec/changes/compact-book-list-items/design.md` for the owner design and `openspec/specs/book-shelf/spec.md` + `openspec/changes/compact-book-list-items/specs/book-shelf/spec.md` for the requirements this change extends.

Today the friend branch in the same component still renders the tall pre-compact layout: a `<p>` of formats joined with ` · `, a `<p>` of every meaningful date joined with ` · ` (no labels), and an inline note preview that renders whenever the card is collapsed. The existing `Details` icon-only `IconButton` (`ChevronDown` closed, `ChevronUp` open) and the existing `expanded` disclosure block are already in place and already work — they just operate on a row that, when collapsed, is far taller than the owner's.

The work in scope is therefore narrow: drop the always-visible formats line, drop the always-visible four-date line, drop the inline note preview, and render the same `lastMeaningfulDate` line the owner branch already renders. The `Details` toggle and disclosure block, the `AddToShelfButton`, the sort dropdown, and the owner branch stay exactly as they are.

## Goals / Non-Goals

**Goals:**

- Render the friend branch's collapsed row to match the owner branch's collapsed row shape: title + author, status badge, a single labeled last-meaningful date, and the existing icon-only `Details` + `AddToShelfButton` actions.
- Reuse the existing `lastMeaningfulDate` helper and the existing `shelf.*On` templates — no new locale strings.
- Keep the existing `Details` toggle, the existing `expanded` disclosure block, the `AddToShelfButton`, and the sort dropdown untouched.
- Stay inside the existing icon-system primitive (`<IconButton>`) and the existing date-formatting helper.

**Non-Goals:**

- No changes to `BookRecord`, the database, server actions, or the recommendation / copy-to-shelf flows.
- No changes to the owner branch.
- No new icons, no new dictionary keys, no new components.
- No changes to the `compact-book-list-items` delta (its scenarios remain accurate for the owner).

## Decisions

### Decision 1: Mirror the owner branch's collapsed body in the friend branch

- **Rationale:** The owner branch in `book-list.tsx` already has the exact "compact row" shape we want. The friend branch lives a few lines below and uses the same `book`, `formatDate`, `t`, `expanded`, and `lastDate` locals. We render the friend card's body by reusing the same `<h2>` title line, the same status badge row, the same single `lastDate` paragraph, and the same icon-only `Details` + `AddToShelfButton` actions. The only thing the friend branch keeps that the owner branch does not is the `AddToShelfButton` — everything else collapses into the owner's shape.
- **Alternatives considered:** Extract a shared `<BookRowBody>` component used by both branches. Rejected for this change: extracting a component would require either (a) parametrizing owner vs. friend actions, which already differ in shape (`ChangeStatus`, `IconLinkButton`, `RecommendPanel`, delete form vs. `IconButton` + `AddToShelfButton`) or (b) duplicating the body markup. For one branch it's not worth the abstraction. Future changes can extract it if a third audience appears.
- **Alternative considered:** Move the friend card to a separate component. Rejected — the sort, expansion, and disclosure mechanics all live in `BookList` and lifting them would force a larger refactor than this change requires.

### Decision 2: Reuse `lastMeaningfulDate` and the `shelf.*On` templates

- **Rationale:** `lastMeaningfulDate` already returns a localized string for the first non-null of `finished_at` → `started_at` → `abandoned_at` → `date_added`. The friend branch already computes `lastDate` today (it just renders formats + the four-date line below instead of `lastDate`). We render `<p className="text-xs text-zinc-400">{lastDate}</p>` — identical to the owner branch.
- **Alternatives considered:** Computing a different date for the friend (e.g. always `Added`). Rejected because the precedence is a presentation concern, not an audience concern; friends benefit from the same "what happened most recently" signal.

### Decision 3: Delete the friend-branch `<p>` of formats and the friend-branch four-date `<p>`

- **Rationale:** Both are removed from the collapsed row because (a) the `expanded` disclosure block already renders both with localized labels, and (b) the spec for the owner compact card explicitly forbids showing them by default. The friend disclosure block already lists formats and every date with its localized label — nothing is lost; it just moves behind the `Details` toggle like the owner's.
- **Alternatives considered:** Keep formats visible on the friend card because they appear small in the screenshot. Rejected: consistency with the owner row is the explicit user request; the friend view gains parity at the cost of one more click for formats.

### Decision 4: Delete the inline note preview from the friend-branch collapsed state

- **Rationale:** The current code at `book-list.tsx` lines 239–249 renders a `<div>` with `bg-zinc-50` containing the note when collapsed. The owner branch does not render this — it moves the note into the disclosure. We delete it from the friend branch and rely on the existing `expanded` disclosure block (which already renders the note with its label) to make it reachable.
- **Alternatives considered:** Keep the inline note preview. Rejected because it is the third visual difference between the two card surfaces and the user has asked for the friend view to look like the owner view.
- **Note:** This change deletes a JSX subtree but not a requirement: the friend `Details` toggle's existing scenarios (in `openspec/specs/friendships/spec.md`) already require that the note be reachable when the toggle is open, which the disclosure block continues to satisfy.

### Decision 5: No new locale strings

- **Rationale:** `shelf.finishedOn`, `shelf.startedOn`, `shelf.abandonedOn`, `shelf.addedOn`, `shelf.details`, `shelf.detailsAria`, `shelf.showLess`, `shelf.showLessAria`, `shelf.addToShelfAria` are already present in both `en.json` and `es.json`. The friend branch already imports them. No new keys, no translator workload.
- **Alternatives considered:** Renaming `shelf.details` / `shelf.detailsAria` to `shelf.showDetails` / `shelf.showDetailsAria` for parity with the owner. Rejected — the friend label and the owner label are conceptually different surfaces ("Details" for a friend's view vs. "Show details" for the owner row), and the previous change deliberately kept them apart (see `compact-book-list-items/design.md` Decision 5). Mirroring the owner visually does not require mirroring the labels.

## Risks / Trade-offs

- [Friends lose default visibility of formats / every date / note preview] → Mitigation: the existing icon-only `Details` toggle already reveals all three inside the disclosure. The toggle has a localized `aria-label` and remains keyboard reachable.
- [Friend row may look identical to the owner row at a glance, blurring audience context] → Acceptable: the page title (`@<username>'s estantería`) and the action set (`Add to my shelf` instead of `Edit`/`Delete`/`Recommend`) already disambiguate. Visual parity is the explicit goal.
- [Disclosure height jumps when toggled] → Already the existing behavior on both branches; not introduced by this change.
- [Drift between friend and owner compact rows over time] → Mitigation: the `book-shelf` spec delta in this change now explicitly states that the friend row shape SHALL match the owner row shape. Any future change that re-orders the owner row has to update both branches (or this delta).

## Migration Plan

No data migration. Deploy is a single component edit (`app/components/book-list.tsx`, friend branch only). Rollback is a single revert of that file — no schema, no API, no locale file changes.

## Open Questions

None.
