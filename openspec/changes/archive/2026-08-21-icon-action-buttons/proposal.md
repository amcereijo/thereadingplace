## Why

Action buttons and links across the app (e.g. shelf row actions, recommendation accept/dismiss, status filter pills, navigation) carry English/Spanish text labels that crowd dense surfaces like the book list and the shelf nav. The header nav, the book-list action column, and the shelf status filter are visually heavy with text and would benefit from icon-only representations. The app already uses one inline SVG (`back-button.tsx`), so there is no icon library today and no shared icon set. We will adopt a small icon library and convert the high-frequency, unambiguous actions to icon-only buttons with localized `aria-label`s, keeping form submit/CTAs as text where the verb is essential.

## What Changes

- Add `lucide-react` as a dependency for a consistent icon set.
- Convert the following text buttons/links to icon-only buttons with localized `aria-label`s (label text remains in the dictionary for screen readers):
  - `book-list.tsx` row actions: **Change status**, **Edit**, **Recommend**, **Delete** (owner view); **Add to shelf** (friend view); **Details**/**Show less** (friend view).
  - `recommendation-row.tsx`: **Accept**, **Dismiss**.
  - `shelf-nav.tsx` status filter pills: **All**, **To read**, **Reading**, **Read**, **Abandoned**.
  - `friends-list.tsx` friend card: **View shelf**.
  - `edit-book-form.tsx` metadata row remove button (currently a `✕` glyph).
  - `goodreads-importer.tsx` dropzone: add a `Upload` icon to the "Drag and drop" hint.
- Keep as text:
  - Form submit buttons: **Save**, **Cancel**, **Discard changes**, **Confirm**, **Send recommendation**, **Accept** (inside dialog), **Invite**, **Create new-member link**, **Go to shelf**.
  - The language toggle (`EN | ES`).
  - Sort dropdown, status badges, page/section titles, landing page CTAs.
- Migrate `back-button.tsx` from inline SVG to Lucide for visual consistency.
- Add new i18n keys to `lib/i18n/en.json` and `lib/i18n/es.json` for every icon-only button's `aria-label`.
- Add a small `<IconButton>` UI primitive in `app/components/ui.tsx` that renders a square, accessible icon button with the existing variants (`primary | secondary | danger | ghost`).
- **BREAKING**: visually, any consumer that relied on visible text labels on the affected buttons will now see only icons. The text remains for assistive technology.

## Capabilities

### New Capabilities

- `icon-system`: Defines the icon library dependency, the `<IconButton>` UI primitive, the icon sizing/color conventions, and the accessibility contract for icon-only buttons (localized `aria-label`, decorative `aria-hidden` when paired with text).

### Modified Capabilities

- `internationalization`: Add `aria-label` strings for every action that becomes icon-only. Existing translation keys are not removed; new keys live alongside the existing labels (e.g. `shelf.editAria`, `recommendations.acceptAria`, `status.to-readAria`).
- `book-shelf`: The owner-facing row actions (Change status, Edit, Recommend, Delete) render as icon-only buttons with localized `aria-label`s. The friend-view "Add to shelf" action and the "Details" toggle also become icon-only.
- `friend-shelf-actions`: "Add to shelf" is now an icon-only button; the dialog title and body copy are unchanged.
- `friendships`: Friend card "View shelf" link becomes an icon-only button; incoming-request **Accept**/**Decline** keep their visible text (deferred).
- `recommendations`: **Accept** and **Dismiss** actions on recommendation rows become icon-only buttons; the dialog submit buttons keep text.
- `landing-page`: No change to landing-page requirements (CTAs remain text). Listed here only to record that the decision was made to *not* change it.

## Impact

- **New dependency**: `lucide-react` (ISC license). Adds ~12-20 KB gzipped across the icons actually imported; tree-shaken per import.
- **Files modified**:
  - `package.json`, `package-lock.json` (new dep)
  - `app/components/ui.tsx` (add `IconButton` primitive)
  - `app/components/book-list.tsx` (row actions)
  - `app/components/recommendation-row.tsx` (accept/dismiss)
  - `app/components/shelf-nav.tsx` (status pills)
  - `app/components/friends-list.tsx` (view shelf)
  - `app/components/edit-book-form.tsx` (meta row remove)
  - `app/components/goodreads-importer.tsx` (dropzone icon)
  - `app/components/back-button.tsx` (migrate to Lucide)
  - `app/layout.tsx` (no functional change; may adjust nav classes for icon-only)
  - `lib/i18n/en.json`, `lib/i18n/es.json` (new `*Aria` keys)
- **Accessibility**: every icon-only button must have a localized `aria-label`; decorative icons paired with visible text must have `aria-hidden="true"`.
- **Visual density**: row-action column in `book-list` shrinks from 4 stacked text buttons to a compact row of 4 icon buttons; shelf-nav pills become narrower.
- **No DB / schema / API changes.**
