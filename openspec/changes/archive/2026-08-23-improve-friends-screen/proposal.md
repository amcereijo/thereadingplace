## Why

The friends management page is a single long scroll with four loosely-related sections (your friends, two invite flows, and two pending-request lists) and the side nav does not signal when someone has invited you. People miss incoming requests and do not notice the invite affordances.

## What Changes

- Add a pending-incoming-requests badge to the "Friends" item in the side nav, next to the recommendations badge pattern that already exists. The badge shows the count of incoming (received) pending requests that the signed-in user has not yet answered, and disappears when the count is zero.
- Reorganize the friends page so the three concerns — **your friends**, **invite a friend**, and **pending invitations** — are visually separated into three clearly labeled groups, each with a heading and a short helper sentence that explains the group.
- Inside the **pending invitations** group, render two side-by-side sub-sections: "Received" (incoming, with accept/decline) and "Sent" (outgoing, read-only with a "pending" tag). Each sub-section shows an empty state with a short line telling the user what it would mean to have an entry.
- Keep the existing accepted-friends list as the first group (per current `friendships` spec) and keep the two existing invite affordances (invite by username, mint a new-member link) inside the "Invite a friend" group, in that order.

## Capabilities

### New Capabilities
- `friend-screen-ux`: presentation and layout of the friends management page, including the three-group structure, helper copy, empty states, and the per-section ordering. Also covers the friends nav-badge for pending incoming requests.

### Modified Capabilities
- `friendships`: the page now groups pending requests under one "Pending invitations" section with "Received" and "Sent" sub-sections, and the friends nav item shows a badge with the count of incoming pending requests. The existing requirement that "the accepted friends section SHALL appear first" still holds.

## Impact

- `app/friends/page.tsx` — restructured into three groups; outgoing requests move under the same section as incoming requests.
- `app/components/side-nav.tsx` and `app/components/nav-header.tsx` — accept a new `incomingPendingRequests` count prop and pass it into `buildItems`, mirroring the `unreadRecommendations` badge.
- `app/layout.tsx` — fetch the incoming-pending count (already done per-request by `listIncomingPending` in `lib/friendships.ts`) and pass it to `NavHeader` and `SideNavDesktop`.
- `lib/i18n/en.json` and `lib/i18n/es.json` — add the three group titles, helper copy, and badge aria-label under the `friends` key (e.g. `friends.yourFriends`, `friends.inviteAGroup`, `friends.inviteAGroupHelper`, `friends.pendingInvitations`, `friends.received`, `friends.sent`, `friends.receivedNone`, `friends.sentNone`, `friends.pendingRequestsAria`).
- `openspec/specs/friendships/spec.md` — add a delta covering the "Pending invitations" grouping and the nav badge.
