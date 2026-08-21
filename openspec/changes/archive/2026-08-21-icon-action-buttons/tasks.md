## 1. Setup

- [ ] 1.1 Install `lucide-react` as a dependency
- [ ] 1.2 Add `*Aria` i18n keys to `lib/i18n/en.json`
- [ ] 1.3 Mirror the new `*Aria` keys in `lib/i18n/es.json`

## 2. UI primitive

- [ ] 2.1 Add `<IconButton>` primitive to `app/components/ui.tsx` (h-9 w-9, four variants, required `aria-label`, required `icon`, icon wrapped in `aria-hidden` span)
- [ ] 2.2 Add an icon-friendly variant helper or document that icons use `h-4 w-4` inside `<Button>` and `h-5 w-5` inside `<IconButton>`

## 3. Migrate existing inline SVG

- [ ] 3.1 Replace the inline SVG in `app/components/back-button.tsx` with `ArrowLeft` from `lucide-react`

## 4. Book list row actions

- [ ] 4.1 Convert owner-view row actions (`Change status`, `Edit`, `Recommend`, `Delete`) to icon-only `<IconButton>`s with localized aria-labels in `app/components/book-list.tsx`
- [ ] 4.2 Switch the row action column from `flex-col` to `flex-row` so the icons sit side-by-side
- [ ] 4.3 Convert friend-view row actions (`Details`/`Show less`, `Add to shelf`) to icon-only `<IconButton>`s with localized aria-labels

## 5. Recommendation rows

- [ ] 5.1 Convert `Accept` and `Dismiss` triggers on `RecommendationRow` to icon-only `<IconButton>`s with localized aria-labels in `app/components/recommendation-row.tsx`
- [ ] 5.2 Confirm that the dialog submit/cancel buttons inside the Accept and Dismiss modals still render as text

## 6. Shelf nav

- [ ] 6.1 Convert each `ShelfNav` pill to an icon-only link in `app/components/shelf-nav.tsx`
- [ ] 6.2 Keep the count badge visible; add a localized `aria-label` that includes the status and the count, and a `title` for hover tooltips

## 7. Friend cards

- [ ] 7.1 Convert the `View shelf` link on each friend card to an icon-only link with a localized `aria-label` in `app/components/friends-list.tsx`

## 8. Edit book form

- [ ] 8.1 Replace the `✕` text glyph on the remove-metadata-row button with an `X` icon and add a localized `aria-label` in `app/components/edit-book-form.tsx`

## 9. Goodreads importer

- [ ] 9.1 Add an `Upload` icon next to the "Drag and drop" text in the dropzone in `app/components/goodreads-importer.tsx`; mark the icon as `aria-hidden="true"` because the visible text already describes the action

## 10. Verification

- [ ] 10.1 Run `npm run lint`
- [ ] 10.2 Run `npm run build`
- [ ] 10.3 Manual smoke: own shelf, friend shelf, `/recommendations` (accept + dismiss dialogs), friends page, edit book page, import page, and toggle `EN`/`ES` on each
- [ ] 10.4 Keyboard-only smoke: tab through the book-list row actions and the shelf-nav pills, confirm focus rings and `aria-label` announcements
