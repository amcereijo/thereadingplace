## Why

People on the same shelves can already see each other's books, and any signed-in viewer can copy a friend's book to their own shelf with a chosen status. But there's no way for the owner of a book to actively say "I think you would like this" to a specific friend. Recommendations today depend on the friend stumbling across the book — that's a pull, not a push. Adding a sender-initiated recommendation flow closes that gap while keeping the shelf strictly personal: nothing the sender does ever writes a book onto the receiver's shelf.

## What Changes

- Add a new `recommendations` data collection that stores a sender, a receiver, snapshotted book fields, an optional personal message, and a status (`pending`, `accepted`, `dismissed`) with corresponding timestamps.
- Add four server actions: send, mark-seen, accept, dismiss. Acceptance calls a new `copyBookFromSnapshot` library function so the snapshot fields (not the live source book) drive the copy. No existing book-writing action is reused for this flow.
- Add a `/recommendations` page with two sections — received (top) and sent (bottom). Both sections render together whenever the user has any recommendations in either direction.
- Surface a `Recommendations` entry in the existing shelf navigation, rendered only when the user has at least one recommendation (any status).
- Add a `Recommend` action on the owner's book list and on the owner's book edit/detail view. Both open a single panel component for choosing the friend and writing an optional message.
- Mark a recommendation as seen on render of the received list.
- No rescind: once sent, a recommendation cannot be withdrawn by the sender. Accepted and dismissed rows stay visible as a memory of what was sent and how it landed.

## Capabilities

### New Capabilities

- `recommendations`: Sending, seeing, accepting, and dismissing book recommendations between accepted friends. Covers the data model, the four actions, the `/recommendations` page, the nav entry, and the "no push to shelves" invariant.

### Modified Capabilities

- `book-shelf`: The owner's all-books view and edit view gain a `Recommend` action that opens the recommendation panel.

## Impact

- `lib/db/schema.ts`: new `recommendations` table.
- `lib/recommendations.ts` (new): queries for send, list-received, list-sent, mark-seen, accept, dismiss; a `copyBookFromSnapshot` lib function (companion to the existing `copyBook` in `lib/books.ts`).
- `app/actions/recommendations.ts` (new): the four server actions.
- `app/recommendations/page.tsx` (new): the received-and-sent page.
- `app/components/recommend-panel.tsx` (new): the panel for choosing friend + message, opened from book list and edit view.
- `app/components/book-list.tsx`: add the `Recommend` button to owner-mode cards.
- `app/components/edit-book-form.tsx` (or whichever component owns the edit view): add a sibling `Recommend` button.
- `app/components/shelf-nav.tsx`: render the `Recommendations` entry conditionally on having any recommendation rows for the viewer.
- i18n: new translation keys for recommendation labels, status labels, button text, panel placeholders.
