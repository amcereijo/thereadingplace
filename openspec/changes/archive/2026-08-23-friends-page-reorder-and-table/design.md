## Context

The previous change `improve-friends-screen` introduced a three-group layout (Your friends, Invite a friend, Pending invitations) and a side-nav badge for incoming pending requests. Real usage shows that with more than a handful of friends, the user must scroll past every friend card to reach the actions they came for. We want the most actionable thing — incoming pending requests — visible at the top, a dense table for the friends list, and the full invite + pending blocks at the bottom for users who want the details. The side-nav badge, the existing actions, and the data model are all unchanged.

## Goals / Non-Goals

**Goals:**
- Put a compact pending-invitations preview at the top of the page with up to 3 incoming requests, a "View all (N)" link, and an "Invite a friend" link.
- Convert the friends list to a dense table with a working filter input.
- Keep the full Pending invitations block (Received + Sent) and the Invite a friend block at the bottom of the page.

**Non-Goals:**
- No new data model. `listIncomingPending` and `listOutgoingPending` are reused.
- No new actions. Accept/decline continue to use `acceptInviteAction` / `declineInviteAction`.
- No changes to the side-nav badge.
- No pagination, virtualization, or server-side filter — the search runs in the client like the existing one.
- No real-time updates.

## Decisions

### 1. Pending preview is a server component, anchor-linked
The top preview is a small server component (`app/components/pending-invitations-preview.tsx`) that receives the first three `listIncomingPending` rows and the total count. The "View all" link is an anchor (`#pending-invitations`) to the section heading below; the "Invite a friend" link is an anchor (`#invite-a-friend`) to the Invite block. Anchor links are smooth-scroll friendly and avoid the need for a client router hop. The component renders the same `Card` + accept/decline form pattern that the page already uses, so we are not introducing new form plumbing.

**Alternatives considered:**
- *Make the preview a client component that fetches the count* — pointless since the page already has the data server-side.
- *Use a popover/dropdown* — the user explicitly asked for a top-of-page preview, not a popover.

### 2. Friends list becomes a real `<table>` with sticky-feel rows
`FriendsList` keeps its client-side `useState` search and `useMemo` filter, but the JSX changes from a `<ul>` of cards to a `<table>` with a header row and a body. We use Tailwind's `divide-y` for row separators instead of card borders. Each row has: avatar (kept), `@username` (kept), and the view-shelf icon button (kept). The view-shelf button keeps its `aria-label` and `title`. The search input is a sibling of the table, above it, so it stays visible while the user filters.

We do *not* use `Card` for each row — that would keep the bulky padding. The rows are plain `<tr>` with `py-2` cells. Empty state replaces the `<table>` with a single `<p>` (the existing `EmptyState`).

**Alternatives considered:**
- *Role-based div table* — equivalent but loses real `<th>` semantics. Going with `<table>` is more accessible.
- *Card rows with reduced padding* — visually still cardy. The user asked for "table-like".

### 3. The full Pending invitations block stays as it is
The bottom Pending invitations block keeps its current `grid gap-4 sm:grid-cols-2` layout for Received + Sent sub-sections. We add an `id="pending-invitations"` to the section heading so the top preview's "View all" link can anchor to it. No structural change.

### 4. The Invite a friend block stays as it is
The Invite block at the bottom of the page is unchanged except for an `id="invite-a-friend"` on the section heading for the top preview's anchor.

### 5. i18n keys
We add the following keys to the `friends.*` block in both dictionaries:

- `pendingSummaryTitle` — heading for the top preview, e.g. "Pending invitations" (English) / "Invitaciones pendientes" (Spanish). We can reuse the existing `pendingInvitations` value or add a new key for the smaller heading style; decision: add a new key with a slightly shorter wording.
- `viewAll` — "View all" / "Ver todo".
- `viewAllCount` — "View all ({count})" / "Ver todo ({count})".
- `topNone` — "No pending invitations." / "No tienes invitaciones pendientes."
- `inviteFriendLink` — "Invite a friend" / "Invitar a un amigo" (used as the link text in the top preview).
- `topMore` — "and {n} more" / "y {n} más" (used inside the preview when there are more than 3).
- `friendsTableHeaderName` — "@username" / "@usuario" (the visible header text; this is a small concession to making the table feel like a table — but since usernames always start with `@`, the value can also be a friendlier "Username" / "Nombre de usuario" with the leading `@` on the cell itself).
- `friendsTableHeaderAction` — "Action" / "Acción" (a11y-friendly header; the cell itself is icon-only).
- `friendsCount` — "{n} friends" / "{n} amigos" (optional small caption above the table).

We retire no existing keys; the prior `pendingInvitations`, `received`, `sent`, `none`, `receivedNone`, `sentNone`, `pending` keys continue to be used in the bottom block.

## Risks / Trade-offs

- [Top preview duplicates the Received sub-section content] → Mitigation: the preview is capped at 3 and lives in a different visual region (compact, single-column list of rows). The bottom block remains the canonical view.
- [Anchor links break if the page is shortened] → Mitigation: when the user has no incoming requests, the top preview's "View all" link is hidden, so the only anchor that exists is the "Invite a friend" one. Anchor scroll is purely additive.
- [Search still client-side; long lists still re-render the whole table on each keystroke] → Mitigation: the existing implementation already does this; the table form is no worse. Out of scope to change to server-side filter.
- [Adding `id` attributes to existing section headings is a small coupling risk] → Mitigation: ids are stable strings; future refactors must preserve them, but that's a normal cost of anchor links.

## Migration Plan

No data migration. The change is layout, component, and i18n updates. Roll back by reverting: `app/friends/page.tsx`, `app/components/friends-list.tsx`, the new `app/components/pending-invitations-preview.tsx`, and the two dictionary files.

## Open Questions

- Should the top preview also show the Sent (outgoing) sub-section in a collapsed form? Deferred: the user only asked for a preview of *received* (the actionable side). Outgoing is informational and stays in the bottom block.
- Should the table include a sortable header (by username, by recency)? Deferred: not requested; would need a new spec change.
