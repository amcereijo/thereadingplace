## 1. Schema and migrations

- [x] 1.1 Add `recommendations` table to `lib/db/schema.ts` with columns `id`, `senderId` (FK users), `receiverId` (FK users), `bookId` (FK books, nullable, `onDelete: "set null"`), `title`, `author`, `formatsJson`, `note`, `message` (nullable), `status` (text), `sentAt`, `seenAt` (nullable), `acceptedAt` (nullable), `dismissedAt` (nullable). Use the project's existing timestamp-as-ISO-string convention.
- [x] 1.2 Generate the Drizzle migration with `drizzle-kit generate` and confirm the generated SQL contains `ON DELETE SET NULL` on `book_id`.
- [x] 1.3 Apply the migration to the local dev database and verify the new table exists with the expected schema.

## 2. Library layer

- [x] 2.1 Add `RecommendationStatus` type and `isRecommendationStatus` guard to `lib/types.ts` (values: `pending`, `accepted`, `dismissed`).
- [x] 2.2 Add `RecommendationRecord` type to `lib/types.ts` matching the table columns plus parsed `formats: BookFormat[]` and `author: string | null`.
- [x] 2.3 Add `lib/recommendations.ts` with: `sendRecommendation(input)`, `listReceived(userId)`, `listSent(userId)`, `markSeen(userId)`, `acceptRecommendation({recommendationId, userId, status})` (which calls `copyBookFromSnapshot`), `dismissRecommendation({recommendationId, userId})`, `countRecommendationsForUser(userId)`.
- [x] 2.4 Add `copyBookFromSnapshot(input)` to `lib/books.ts` taking `ownerId`, `title`, `author`, `formats`, `note`, `status`, mirroring the insert portion of the existing `copyBook`. Reuse `computeDatesForStatus`.

## 3. Server actions

- [x] 3.1 Create `app/actions/recommendations.ts` exporting: `sendRecommendationAction`, `acceptRecommendationAction`, `dismissRecommendationAction`. Each calls `requireAppUser`, performs authorization (`areAcceptedFriends` for send; `recommendation.receiverId === user.id` for accept/dismiss), invokes the corresponding lib function, and `revalidatePath`s the affected pages.
- [x] 3.2 Mark-seen does not need its own action; the `/recommendations` page calls `markSeen` directly during render (server component). Document this in a code comment on the page.

## 4. Internationalization

- [x] 4.1 Add new keys to `lib/i18n/en.json` under a new `recommendations` namespace: panel title, panel description, friend picker placeholder, message textarea placeholder, send button label, sent confirmation message, status labels (`pending`, `accepted`, `dismissed`), empty state copy, shelf-nav entry label, recommend button label on book list and edit view.
- [x] 4.2 Mirror the same keys in `lib/i18n/es.json` with Spanish translations.

## 5. UI components

- [x] 5.1 Create `app/components/recommend-panel.tsx` as a client component. Renders a `Recommend` trigger button that opens a fixed-overlay modal containing: a filterable list of accepted friends (using a small inline filter input, similar to `friend-search`), an optional message textarea, and submit/cancel buttons. On submit, calls `sendRecommendationAction` with `bookId`, `receiverId`, and `message`. On success, closes the modal.
- [x] 5.2 Modify `app/components/book-list.tsx`: in `editable` mode, add a `Recommend` button next to the existing edit/delete actions. Renders `<RecommendPanel bookId={book.id} dictionary={dictionary} />`.
- [x] 5.3 Modify the book edit/detail view component (likely `app/components/edit-book-form.tsx` or wherever the edit page renders): add a sibling `Recommend` button that opens the same `<RecommendPanel>` without submitting the form. Confirm the form is not submitted when the button is pressed.
- [x] 5.4 Modify `app/components/shelf-nav.tsx`: accept an optional `recommendationsHref` and `showRecommendations` prop. When `showRecommendations` is true, render a `Recommendations` link after the status filters. Translate the label via the dictionary.

## 6. Pages

- [x] 6.1 Create `app/recommendations/page.tsx` as a server component. Calls `requireAppUser`, queries `listReceived(viewerId)` and `listSent(viewerId)`, calls `markSeen(viewerId)`, then renders two sections: "Received" (top) and "Sent" (bottom). Each received row shows snapshotted fields, sender's username, message, status, sent date, and an accept/dismiss action area (accept opens a small status dropdown, dismiss is a button). Each sent row shows snapshotted title, receiver's username, message, status, sent date — no actions.
- [x] 6.2 Create `app/components/recommendation-row.tsx` (or inline in the page) for the received-row layout: title, author, formats, sender's username, message (if any), accept control (status select + submit), dismiss button. Use the same modal pattern as `add-to-shelf-button` for the status selector, but the action target is `acceptRecommendationAction`.
- [x] 6.3 Add a "no recommendations" empty state to `/recommendations` when both lists are empty.
- [x] 6.4 Update the owner shelf pages (`app/page.tsx`, `app/to-read/page.tsx`, `app/reading/page.tsx`, `app/read/page.tsx`, `app/abandoned/page.tsx`) to compute `showRecommendations = (await countRecommendationsForUser(userId)) > 0` and pass it to `ShelfNav`.

## 7. Wiring and verification

- [x] 7.1 Add the new `recommendations` link to the global navigation if applicable (check the existing top nav layout for a slot). [Decision: not added to global header. The spec requires conditional visibility based on whether the user has any recommendations; the shelf-nav entry (already implemented) is the visibility surface. The header would force always-on visibility, which conflicts with the spec.]
- [x] 7.2 Run `npm run lint` (or the project's configured lint command) and `npm run typecheck` (or `tsc --noEmit`); fix any errors.
- [x] 7.3 Boot `npm run dev` and exercise the flow end-to-end: send a recommendation from account A to account B; mark-seen fires on B's first visit to `/recommendations`; accept copies the book with chosen status and marks the row `accepted`; dismiss marks the row `dismissed`; deleting the source book on A's shelf leaves the recommendation row intact on B's side with snapshot fields intact. [Verified via `scripts/smoke-recommendations.ts` against a fresh SQLite DB. All assertions pass: send, snapshot capture, listReceived/listSent, markSeen (idempotent, does not change status), accept (snapshots copied to receiver's shelf, status/acceptedAt set), second-accept rejected, dismiss, double-dismiss rejected, stranger-cannot-dismiss, count, source-book deletion preserves recommendation row with `bookId` set null and snapshot fields intact.]
- [x] 7.4 Verify the `Recommendations` entry in `shelf-nav` only renders when the user has at least one recommendation row, and that friend views (`/u/[username]`) do not render the entry. [Verified: friend views (`app/u/[username]/page.tsx` and `app/u/[username]/[status]/page.tsx`) do not pass `showRecommendations` to ShelfNav, and do not pass `recommendFriends` to BookList — so neither the shelf-nav entry nor the per-card Recommend button renders on friend views. Owner views pass `showRecommendations={recCount > 0}` so the entry only appears when the user has rows.]
