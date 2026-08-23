## 1. Locale strings

- [x] 1.1 Add `shelf.showDetails` and `shelf.showDetailsAria` to `lib/i18n/en.json` with the strings `"Show details"` and `"Show book details"`.
- [x] 1.2 Add the Spanish translations `shelf.showDetails` = `"Ver detalles"` and `shelf.showDetailsAria` = `"Ver detalles del libro"` to `lib/i18n/es.json`.

## 2. Compact owner card rendering

- [x] 2.1 In `app/components/book-list.tsx`, remove the always-visible formats `<p>`, the four-element dates `<p>`, and the inline note preview from the owner (`editable`) branch of the card body.
- [x] 2.2 In the same branch, render a single date line whose text comes from the first non-null field of `finished_at` → `started_at` → `abandoned_at` → `date_added`, formatted via `formatBookDate(value, locale)` and prefixed with the matching localized template (`shelf.finishedOn` / `shelf.startedOn` / `shelf.abandonedOn` / `shelf.addedOn`).
- [x] 2.3 Add an icon-only `<IconButton>` (`ChevronDown` when closed, `ChevronUp` when open) inside the owner actions row that calls `setExpandedId(expanded ? null : book.id)`, with `aria-label` and `title` from `dictionary.shelf.showDetailsAria` / `dictionary.shelf.showDetails` (and `showLessAria` / `showLess` when open).
- [x] 2.4 Make the existing `expanded` disclosure block render for the owner branch too (currently only the friend branch renders it), so the owner sees formats, every date with its localized label, the note (if any), and metadata when the toggle is open.
- [x] 2.5 Ensure the owner actions row keeps the existing `Change status`, `Edit`, `Recommend`, and `Delete` icon-only buttons in the same order; the new toggle can sit at the right end of that row.

## 3. Verification

- [x] 3.1 Run the project's lint and typecheck (e.g. `pnpm lint`, `pnpm typecheck` — confirm via `package.json` if those scripts differ) and resolve any new errors.
- [x] 3.2 Visually confirm on `/` and on `/reading` that each card shows only title+author, status badge, single date, and the row actions (no formats line, no four-date line, no inline note preview), and that activating the new toggle reveals the disclosure.
- [x] 3.3 Confirm the friend shelf view at `/u/<username>` still renders its existing card and details toggle unchanged.
- [x] 3.4 Switch the locale to Spanish and confirm the new toggle label and date labels are translated.
