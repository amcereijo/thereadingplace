## 1. i18n

- [x] 1.1 Add new friends.* keys to `lib/i18n/en.json`: `pendingSummaryTitle`, `viewAll`, `viewAllCount`, `topNone`, `inviteFriendLink`, `topMore`, `friendsTableHeaderName`, `friendsTableHeaderAction`, `friendsCount`.
- [x] 1.2 Add the same keys with Spanish translations to `lib/i18n/es.json`.

## 2. Top pending preview component

- [x] 2.1 Create `app/components/pending-invitations-preview.tsx` as a server component. Props: `incoming: ListIncomingPendingRow[]` (the full list), `dictionary: Dictionary`. Renders up to 3 rows with the requester's username and accept/decline forms.
- [x] 2.2 When `incoming.length > 3`, render the "View all (N)" anchor link to `#pending-invitations` and a "Invite a friend" anchor link to `#invite-a-friend`.
- [x] 2.3 When `incoming.length === 0`, render the `topNone` empty-state line and the "Invite a friend" link.
- [x] 2.4 Reuse the existing `Card`, `SectionTitle`, and `FriendRequestSubmit` components for visual consistency.

## 3. Friends list as a table

- [x] 3.1 In `app/components/friends-list.tsx`, replace the card-grid JSX with a `<table>` (or div with `role="table"`) layout: a `<thead>` with a Name and Action header, and a `<tbody>` with one row per friend.
- [x] 3.2 Keep the existing client-side `useState` query and `useMemo` filter behavior; ensure the filter updates the visible rows in place.
- [x] 3.3 Use `divide-y` for row separators and `py-2` cells. Drop the `Card` wrapper around each row.
- [x] 3.4 Preserve the avatar, `@username`, and view-shelf `IconLinkButton` content. Preserve `aria-label` and `title` localization.
- [x] 3.5 Hide the search input when there are no friends at all (current behavior).

## 4. Friends page restructure

- [x] 4.1 In `app/friends/page.tsx`, render the four sections in this order: top pending preview, friends list, full Pending invitations block (Received + Sent sub-sections), Invite a friend block.
- [x] 4.2 Add `id="pending-invitations"` to the Pending invitations section heading and `id="invite-a-friend"` to the Invite a friend section heading.
- [x] 4.3 Slice `incoming` to the first 3 rows for the preview; pass the full list to the bottom Pending invitations block.
- [x] 4.4 Confirm all visible copy goes through the dictionary.

## 5. Verification

- [x] 5.1 Run `npm run lint` and `npx tsc --noEmit` and resolve any errors.
- [x] 5.2 Run `npm run build` and confirm no regressions.
- [x] 5.3 Run `openspec validate friends-page-reorder-and-table --strict` and resolve any reported issues.
- [x] 5.4 Manual exercise of flows (deferred to user; lint/typecheck/build all clean).
