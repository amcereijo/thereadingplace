## 1. Compact friend card body

- [x] 1.1 In `app/components/book-list.tsx`, locate the friend (`friendView`) branch of the card body (currently the `<>` block below the `editable ?` branch) and remove the always-visible formats `<p className="mt-1 text-sm text-zinc-500">{book.formats.join(" · ")}</p>`.
- [x] 1.2 In the same branch, replace the four-element dates `<p>` with a single `<p className="mt-1 text-xs text-zinc-400">{lastDate}</p>` (the `lastDate` local is already computed by `lastMeaningfulDate(book, formatDate, t)` above the JSX).
- [x] 1.3 In the same branch, remove the inline note preview `<div className="mt-3 rounded-lg bg-zinc-50 p-3 ...">` block (the conditional that renders when `book.note && !expanded`) so the note is reachable only through the existing `Details` toggle's disclosure.

## 2. Preserve friend-branch actions and disclosure

- [x] 2.1 Keep the friend branch's right-hand actions row exactly as it is: the existing icon-only `IconButton` (`ChevronDown`/`ChevronUp`) bound to `setExpandedId(...)` with `dictionary.shelf.detailsAria` / `dictionary.shelf.showLessAria` and `dictionary.shelf.details` / `dictionary.shelf.showLess`, followed by the existing `AddToShelfButton`.
- [x] 2.2 Keep the existing `expanded` disclosure block (formats, every meaningful date with its localized label, note when present, metadata) unchanged — the friend branch already renders it identically to the owner branch's disclosure.

## 3. Verification

- [x] 3.1 Run the project's lint and typecheck (consult `package.json` for the exact scripts; the previous change used `pnpm lint` and `pnpm typecheck`) and resolve any new errors.
- [x] 3.2 Visually confirm on `/u/<friend-username>` and `/u/<friend-username>/reading` that each friend card shows only title + author, status badge, single labeled last-meaningful date, and the `Details` + `Add to my shelf` icon-only buttons — with no formats line, no four-date line, and no inline note preview.
- [x] 3.3 Activate the `Details` toggle on a friend card that has formats, multiple dates, and a note, and confirm the disclosure renders formats, every meaningful date with its localized label, the note, and any metadata.
- [x] 3.4 Switch the locale to Spanish and confirm the date label on the collapsed friend row and the disclosure labels are translated.
- [x] 3.5 Confirm the owner views at `/`, `/to-read`, `/reading`, `/read`, `/abandoned` still render their existing compact card and `Show details` toggle unchanged.
