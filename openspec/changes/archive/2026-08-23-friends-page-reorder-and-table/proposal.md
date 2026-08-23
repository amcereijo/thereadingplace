## Why

The current friends page puts the friends list first and pushes invite + pending invitations below it. With a long friends list, the user has to scroll past every friend card before reaching the actions they came for. Also, the friends list is a stack of full-width cards, which scans poorly past a handful of friends. We want a top-of-page preview of the most actionable thing (incoming pending invitations) with a quick path to the rest, a dense table for the friends list with a working filter, and the full invite + pending blocks at the bottom for users who want the details.

## What Changes

- Reorder the friends page to: (1) a compact **Pending invitations preview** at the top, (2) a **Friends table** with a search/filter input, (3) the full **Pending invitations** block (Received + Sent sub-sections), (4) the **Invite a friend** block.
- The top preview shows up to 3 incoming pending requests with accept/decline actions. When there are more than 3, it shows a "View all (N)" link to the full Pending invitations block below. When there are none, it shows a "No pending invitations" line with an "Invite a friend" link to the Invite block below.
- The top preview always includes an "Invite a friend" link to the Invite block.
- Replace the current card-grid `FriendsList` with a denser **table** view: a single search input filters rows in place, each row shows the avatar, `@username`, and a view-shelf icon button, with subtle row separators instead of card borders.
- The existing friend count, search, accept/decline, view-shelf, and empty-state behavior is preserved — only the layout and the order change.

## Capabilities

### Modified Capabilities
- `friend-screen-ux`: change the page order rule to put the pending-invitations preview first, the friends table second, the full Pending invitations block third, and the Invite a friend block fourth. Add the preview and table requirements. The existing "Three-group page layout" and "Pending invitations shows received and sent side by side" requirements are updated, not removed.

## Impact

- `app/friends/page.tsx` — restructure into four sections; pass incoming requests to a new top-preview component.
- `app/components/friends-list.tsx` — convert from card grid to a compact table with the existing search input filtering in place.
- `app/components/pending-invitations-preview.tsx` (new) — small server component that renders the first 3 incoming pending requests with accept/decline forms and a View all / Invite a friend link.
- `lib/i18n/en.json` and `lib/i18n/es.json` — add keys: `pendingSummaryTitle`, `topNone`, `viewAll`, `inviteFriendLink`, `topMore` (e.g. "and {n} more"), `friendsTableHeaderName`, `friendsTableHeaderAction`, `friendsCount` (e.g. "{n} friends").
