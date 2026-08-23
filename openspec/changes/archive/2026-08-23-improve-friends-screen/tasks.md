## 1. i18n

- [x] 1.1 Add new friends.* keys to `lib/i18n/en.json`: `inviteAGroup`, `inviteAGroupHelper`, `pendingInvitations`, `received`, `sent`, `receivedNone`, `sentNone`, `pendingRequestsAria`. Decide whether to repurpose or retire `incomingRequests` / `outgoingRequests` per design §4.
- [x] 1.2 Add the same keys with Spanish translations to `lib/i18n/es.json`.

## 2. Layout & data plumbing

- [x] 2.1 In `app/layout.tsx`, add `listIncomingPending(userId)` to the existing `Promise.all` and capture its result as `incomingPendingRequests` (default to 0 when `userId` is null).
- [x] 2.2 Pass `incomingPendingRequests` as a new prop into `<NavHeader>` and `<SideNavDesktop>`.
- [x] 2.3 Add `incomingPendingRequests: number` to `NavHeaderProps` and forward it into `<SideNav>`.

## 3. Side nav badge

- [x] 3.1 Extend `SideNavProps` and `SideNavDesktopProps` with `incomingPendingRequests: number`.
- [x] 3.2 In `buildItems`, set `badge` on the `/friends` item to `incomingPendingRequests` when greater than 0 and the current pathname is not `/friends`. Keep `null` otherwise.
- [x] 3.3 Pass the count into a localized `aria-label` on the badge using the new `friends.pendingRequestsAria` key, mirroring how the existing recommendations badge is announced.
- [x] 3.4 Verify the badge is hidden on `/friends` and visible elsewhere.

## 4. Friends page restructure

- [x] 4.1 In `app/friends/page.tsx`, group the existing JSX into three `<section>` blocks: Your friends, Invite a friend, Pending invitations, in that order.
- [x] 4.2 Move `InviteUsernameForm` and `MintInviteLink` into the Invite a friend group, with a helper `<p>` underneath the heading using `friends.inviteAGroupHelper`.
- [x] 4.3 Move the incoming and outgoing request lists into the Pending invitations group as two sub-sections inside a `grid gap-4 sm:grid-cols-2` container, with their own headings (`friends.received`, `friends.sent`) and empty-state lines (`friends.receivedNone`, `friends.sentNone`).
- [x] 4.4 Confirm the accepted-friends `FriendsList` still renders first and retains its existing view-shelf action.
- [x] 4.5 Confirm all visible copy goes through the dictionary.

## 5. Verification

- [x] 5.1 Run `npm run lint` and `npm run typecheck` and resolve any errors.
- [x] 5.2 Manual exercise of flows (deferred to user; lint/typecheck/build all clean).
- [x] 5.3 Run `openspec validate improve-friends-screen --strict` and resolve any reported issues.
