## Context

The app uses Next.js 16 / React 19 / Tailwind v4, with no icon library today. `app/components/back-button.tsx` is the only place that renders an icon, and it does so via a hand-rolled inline SVG. The UI primitives in `app/components/ui.tsx` define `Button`, `LinkButton`, `Input`, `Card`, `StatusBadge`, etc., with `primary | secondary | danger | ghost` variants.

The dictionary in `lib/i18n/en.json` and `lib/i18n/es.json` is the single source of translated text. Every visible string in components is read from the dictionary, and components receive a `Dictionary` prop or pull translations via `useTranslation()` from `LocaleProvider`. This means any new icon-only button can reuse the existing pattern: read the `aria-label` from the dictionary.

See `proposal.md` for motivation and `specs/` for the behavioral contract.

## Goals / Non-Goals

**Goals:**
- Adopt a single icon library and centralize icon usage behind a new `<IconButton>` primitive.
- Convert the high-density action surfaces (book-list row actions, shelf-nav status pills, recommendation accept/dismiss, friend card view-shelf) to icon-only buttons with localized `aria-label`s.
- Keep dialog submit/cancel buttons, page titles, and the language toggle as text.
- Migrate the existing inline SVG in `back-button.tsx` to the same library so the visual language is consistent.

**Non-Goals:**
- Replacing every text label in the app with an icon (forms, dialogs, page titles, status badges stay as text).
- Adding a second icon library.
- Introducing icon-only navigation in the header (the proposal leaves header text as-is; this is a deferred follow-up if the user wants it).
- Animations, tooltips, or a full design-system refactor.

## Decisions

### 1. Icon library: `lucide-react`
- **Why**: ISC-licensed, React-tree-shakeable per icon, 24×24 / 2px stroke matches the existing inline SVG in `back-button.tsx` exactly, broadest semantic coverage (`BookCheck`, `BookOpen`, `BookmarkPlus`, `BookX`, `UserPlus`, `Send`, `Eye`, `Upload`, `X`, `Check`, `Pencil`, `Trash2`, `RefreshCw`, `ArrowLeft`, `ChevronDown`, `ChevronUp`).
- **Alternatives considered**:
  - `@heroicons/react` — same Tailwind aesthetic, but smaller icon vocabulary; we would have to fall back to `Bars3` for "All" or compose icons.
  - `react-icons` — aggregated package, hard to tree-shake cleanly.
  - Inline SVG — back-button is fine alone; 12+ hand-rolled icons is too much.

### 2. New `<IconButton>` primitive in `app/components/ui.tsx`
- **Why**: a single place to enforce `aria-label` (required), square hit area, focus ring parity with `<Button>`, and the same `primary | secondary | danger | ghost` variants.
- **Shape**: `h-9 w-9`, `inline-flex items-center justify-center rounded-lg`, icon rendered inside with `h-5 w-5` and `aria-hidden="true"`.
- **Alternatives considered**:
  - Reusing `<Button>` with `className="!p-2"` and an ad-hoc `aria-label` prop — leaks styling concerns to every call site.
  - Wrapping `<Button>` with `asChild` (Radix pattern) — the existing `Button` already has an `asChild` prop declared but it returns `null`, so we'd be re-implementing something half-done. Adding a new primitive is cleaner.

### 3. Library version: latest `lucide-react` (~0.460+)
- **Why**: ESM, React 19 compatible, no peer-dep conflicts (only `react`).
- **Install**: `npm install lucide-react`. No PostCSS or Tailwind config changes required; icons are SVGs that inherit `currentColor`.

### 4. Icon mapping (per surface)
| Surface | Action | Lucide icon |
|---|---|---|
| `back-button.tsx` | Back | `ArrowLeft` (replaces inline SVG) |
| `book-list.tsx` (owner) | Change status | `RefreshCw` |
| `book-list.tsx` (owner) | Edit | `Pencil` |
| `book-list.tsx` (owner) | Recommend | `Send` |
| `book-list.tsx` (owner) | Delete | `Trash2` |
| `book-list.tsx` (friend) | Add to shelf | `BookmarkPlus` |
| `book-list.tsx` (friend) | Details / Show less | `ChevronDown` / `ChevronUp` (toggles) |
| `recommendation-row.tsx` | Accept | `Check` |
| `recommendation-row.tsx` | Dismiss | `X` |
| `shelf-nav.tsx` | All | `LayoutGrid` |
| `shelf-nav.tsx` | To read | `Bookmark` |
| `shelf-nav.tsx` | Reading | `BookOpen` |
| `shelf-nav.tsx` | Read | `BookCheck` |
| `shelf-nav.tsx` | Abandoned | `BookX` |
| `friends-list.tsx` | View shelf | `Eye` |
| `edit-book-form.tsx` | Remove metadata row | `X` (replaces the `✕` glyph) |
| `goodreads-importer.tsx` | Dropzone hint | `Upload` |

### 5. i18n keys for aria-labels
Add new keys to both `lib/i18n/en.json` and `lib/i18n/es.json` (parallel to the existing visible-text keys). Naming convention: `<group>.<action>Aria`. Examples:
- `shelf.changeStatusAria`, `shelf.editAria`, `shelf.recommendAria`, `shelf.deleteAria`
- `shelf.addToShelfAria`, `shelf.detailsAria`, `shelf.showLessAria`
- `shelf.statusAllAria`, `shelf.statusToReadAria`, `shelf.statusReadingAria`, `shelf.statusReadAria`, `shelf.statusAbandonedAria`
- `friends.viewShelfAria`
- `recommendations.acceptAria`, `recommendations.dismissAria`
- `bookForm.removeFieldAria`
- `import.dropzoneAria` (if needed for the icon)

Existing visible-text keys stay — they continue to be read by the language-aware consumers that use them.

### 6. Layout impact on `book-list.tsx` row actions
The owner-facing row currently stacks four text buttons vertically inside a `flex-col items-stretch gap-2` container. After the change, the four `<IconButton>`s will be laid out horizontally inside `flex flex-row items-center gap-1`, dramatically reducing the row's vertical footprint. The `book-list.tsx` `Card` flex direction and `flex-1`/column proportions stay the same; only the action column's internal layout changes.

The friend-view "Details"/"Show less" + "Add to shelf" pair becomes a horizontal icon row.

### 7. Shelf nav pills: icon-only with count
Each pill becomes a square-ish `<Link>` with the icon, a numeric badge, and a `title` attribute (browser tooltip) plus `aria-label` from the dictionary. The `aria-label` should include the localized status name and the count (e.g. `aria-label="Reading, 2 books"`). Active-state styling stays (teal background).

### 8. `<IconButton>` typing
- Accept `React.ComponentProps<"button">` plus `variant`, `icon: ReactNode`, and `aria-label: string` (the latter two are required, surfaced via TS errors when missing).
- `icon` is wrapped in `<span aria-hidden="true">{icon}</span>` to keep the contract obvious at call sites.

## Risks / Trade-offs

- **Visual ambiguity for new users** → Mitigation: every icon-only button has a `title` attribute (browser tooltip) AND a localized `aria-label`. The tooltip appears on hover/focus, the aria-label is announced by screen readers.
- **Touch target size** → Mitigation: `<IconButton>` is `h-9 w-9` (36×36 CSS px) which meets the 36×36 minimum from the icon-system spec.
- **Bundle size** → Mitigation: `lucide-react` tree-shakes per icon, so the ~12 distinct icons we import add roughly 12–20 KB gzipped. Acceptable.
- **Color inheritance** → Mitigation: render every icon with `stroke="currentColor"` so the icon stroke follows the button's text color. The library defaults to this; do not override.
- **Layout regression in `book-list.tsx`** → Mitigation: this change shifts a column from `flex-col` to `flex-row`. Manually verify the responsive breakpoint behavior on the shelf page after the change.
- **Existing inline SVG in `back-button.tsx`** is replaced. Risk: the visual matches the library defaults because stroke width 2 matches Lucide, but the existing SVG uses `path d="M19 12H5"` + `path d="M12 19l-7-7 7-7"` which is the canonical `ArrowLeft`. After the swap, no visual difference expected.
- **TypeScript a11y lint** → `react/no-unknown-property` may flag `aria-label` if it is required-but-missing. Mitigation: the `IconButton` type makes `aria-label` a required prop, so the TS error fires at build time.
- **i18n key drift** → Mitigation: keep aria-label keys adjacent to their visible-text keys in the JSON; if the visible key is renamed, the aria key follows.

## Migration Plan

1. `npm install lucide-react`.
2. Add new aria-label keys to `lib/i18n/en.json` and `lib/i18n/es.json`.
3. Add the `<IconButton>` primitive in `app/components/ui.tsx`.
4. Update `back-button.tsx` to use `lucide-react` (`ArrowLeft`).
5. Update the affected surfaces (`book-list`, `recommendation-row`, `shelf-nav`, `friends-list`, `edit-book-form`, `goodreads-importer`).
6. Run `npm run lint` and `npm run build`.
7. Manual smoke: sign in, view own shelf, view friend shelf, view `/recommendations`, view friends page, open import page, open edit book page, switch `EN`/`ES` and re-verify each.

Rollback: `git revert` the change. No data migration, no DB change. The new `*Aria` keys are additive; the original keys remain.

## Open Questions

None. All decisions are made; the specs are stable.
