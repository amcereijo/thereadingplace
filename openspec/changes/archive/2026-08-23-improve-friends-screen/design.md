## Context

The friends page (`app/friends/page.tsx`) currently stacks four server-rendered sections top-to-bottom: `FriendsList` (accepted friends), invite-by-username, new-member link, then two flat sections for incoming and outgoing pending requests. The side nav (`app/components/side-nav.tsx`) already supports a `badge` per item and today receives `unreadRecommendations` from the root layout, which fetches it via `Promise.all` in `app/layout.tsx`. The i18n dictionaries in `lib/i18n/en.json` and `lib/i18n/es.json` already have a `friends.*` block with keys we will extend. The pattern is established — we are extending it, not introducing it.

## Goals / Non-Goals

**Goals:**
- Restructure the friends page into three groups (Your friends / Invite a friend / Pending invitations) without changing the underlying data or actions.
- Add an `incomingPendingRequests` count that flows into the side nav alongside `unreadRecommendations`, using the existing badge plumbing.
- Add the i18n keys the new structure needs in both `en.json` and `es.json`.

**Non-Goals:**
- No new data model, no schema change. `listIncomingPending` and `listOutgoingPending` in `lib/friendships.ts` already exist.
- No new actions. Accept/decline continue to use the existing `acceptInviteAction` / `declineInviteAction`.
- No changes to the "No ending a friendship in v1" rule.
- No real-time updates — the badge is server-rendered with the rest of the page. A client-side poller or websocket is out of scope.

## Decisions

### 1. Page composition stays server-rendered, layout change only
We keep `app/friends/page.tsx` as an `async` server component. The three groups are JSX sections with `SectionTitle` headings and helper `<p>` text — no new client components. The existing `FriendsList`, `InviteUsernameForm`, `MintInviteLink`, and `FriendRequestSubmit` components are reused as-is. The two pending request lists are moved into a single group with two named sub-sections rendered in a CSS grid (e.g. `grid gap-4 sm:grid-cols-2`).

**Alternatives considered:**
- *Tabs (one tab per group)* — adds a client component for tab state, breaks the "scroll to your concern" mental model, and conflicts with the existing `Friends management page prioritizes existing friends` requirement that mandates a single page.
- *Accordion sections* — hides content and works against the user's request that the lists be "clearly" visible.

### 2. New client wrapper only for the nav badge
We extend `SideNavProps` and `SideNavDesktopProps` with `incomingPendingRequests: number`, mirroring the existing `unreadRecommendations`. In `buildItems`, the `/friends` item gets `badge: incomingPendingRequests > 0 ? incomingPendingRequests : null`, but only when the current pathname is not `/friends` (we hide the badge on the page it points to so it stops being a distraction once the user opens it). The hide-on-active-page check is a small `pathname` comparison inside `buildItems` — no new state.

**Alternatives considered:**
- *Auto-hide the badge once the user accepts/denies from anywhere* — requires a client-side state update, which we'd need to wire through a `router.refresh()` after the form action. More work for marginal value; the page reload after accept/decline already updates the count.
- *Show a separate "Pending" tab inside the friends page that decrements as the user acts* — same trade-off, more state.

### 3. Layout already fetches the count
`app/layout.tsx` runs `Promise.all` over per-user data lookups. We add `listIncomingPending(userId)` to that `Promise.all` and thread the result into `<NavHeader>` and `<SideNavDesktop>`. We do not introduce a shared context, store, or hook — the prop drilling mirrors the existing `unreadRecommendations` flow and is the smallest change.

**Alternatives considered:**
- *A `/api/pending-requests/count` endpoint fetched on the client* — adds network and complexity for a value the layout already needs server-side.
- *Recompute inside `SideNav` (client)* — `SideNav` is a client component and would need a fetch, which races the initial render and shows a flash. The current pattern keeps the badge correct on first paint.

### 4. i18n keys live under `friends.*`
We add the new keys to the existing `friends` block in both dictionaries. The new keys are:

- `friends.inviteAGroup` — heading for the Invite a friend group.
- `friends.inviteAGroupHelper` — the one-sentence helper under that heading.
- `friends.pendingInvitations` — heading for the third group.
- `friends.received` — Received sub-section heading.
- `friends.sent` — Sent sub-section heading.
- `friends.receivedNone` — empty state for Received.
- `friends.sentNone` — empty state for Sent.
- `friends.pendingRequestsAria` — accessible name for the badge, formatted with a count (e.g. "{count} pending friend requests").

We keep the existing `friends.incomingRequests` and `friends.outgoingRequests` keys and let them go unused after the restructure, or repurpose them as the new headings if the English/Spanish strings fit. Decision: repurpose them to `friends.received` / `friends.sent` semantics and remove the old keys only if the new wording fully supersedes them; otherwise leave them and add the new keys without conflict.

## Risks / Trade-offs

- [Stale badge after a friend request is accepted from another tab] → Mitigation: the badge is computed on every server render. Accept/decline server actions call `revalidatePath` for the friends page, so the next navigation shows the right count. Cross-tab staleness is bounded by the user's next page load, which is acceptable for v1.
- [Hiding the badge on `/friends` could confuse users who want to confirm the count they are acting on] → Mitigation: the Pending invitations group itself surfaces the Received count in its heading ("Received (2)"), so the value is visible exactly where the action is.
- [Reuse of `FriendsList`, `InviteUsernameForm`, `MintInviteLink`, `FriendRequestSubmit` keeps the diff small but locks in their current markup] → Mitigation: those components are already styled; we add wrappers (helper `<p>`, group `<section>`) rather than refactoring them. If a component is hard to wrap, the task list will flag it.
- [Adding a fourth `Promise.all` lookup in `app/layout.tsx` increases per-request work for every signed-in page] → Mitigation: `listIncomingPending` is a single indexed query on the friendships table; the cost is negligible compared to the recommendations lookup already in the same `Promise.all`.

## Migration Plan

No data migration. The change is a layout, prop, and i18n-key update. Roll back by reverting the same files: `app/friends/page.tsx`, `app/components/side-nav.tsx`, `app/components/nav-header.tsx`, `app/layout.tsx`, and the two dictionary files.

## Open Questions

- Should the Pending invitations heading also show a parenthetical total (e.g. "Pending invitations (3)") so the user sees the combined count at a glance? Deferred to implementation: if the count is non-zero and the active locale permits, the heading includes "(N)"; otherwise it does not. This does not change the spec because the spec only requires the group to be present, not the count to be in its heading.
- Should the badge cap at "9+" once the count is large, like some apps do? Deferred: current `Recommendations` badge does not cap, so we will not cap here either for consistency. Revisit in a separate change if counts grow.
