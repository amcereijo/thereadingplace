## Context

The Friends page (`/friends`) is a server component that renders invite-by-username, new-member link, incoming/outgoing pending requests, and accepted friends in that order. Existing friends currently appear at the bottom of the page, below every other action. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Make accepted friends the first thing a person sees on the Friends page
- Add a live client-side filter so a person can find a friend by username substring
- Keep all existing invite and request-management flows intact

**Non-Goals:**
- Changing friendship data models or server actions
- Adding friend discovery outside the accepted-friends list
- Removing or combining any existing sections

## Decisions

### Section ordering: existing friends first
**Decision:** Move the "Your friends" section to the top, followed by invite sections and pending requests.

**Rationale:** Once a person has friends, the most common reason to open this page is to reach a friend's shelf. Inviting and managing requests are secondary, less-frequent actions.

**Alternative considered:** Tabs for "Friends", "Invite", "Requests" - rejected because it hides pending requests that may need attention.

### Filtering: client-side search
**Decision:** Add a search input in the "Your friends" section and filter the rendered list in the browser.

**Rationale:** The accepted-friends list is small enough to load fully. A server round-trip is unnecessary and slower for simple substring matching. The list is already rendered from a server component, so the client component can receive the full array and filter it.

**Alternative considered:** Server-side search with a query parameter - rejected because it adds URL complexity and is overkill for a small list.

### Component split
**Decision:** Extract a client `FriendsList` component that owns the search state and the filtered rendering.

**Rationale:** Keeps the page server component for data fetching while isolating the interactive filter logic. The page passes the full friends array as a prop.

### Visual distinction
**Decision:** Use a larger, card-based grid for friends with clear shelf links. Keep pending requests as a compact list below.

**Rationale:** Cards give each friend equal visual weight and a clear tap target for "View shelf". Pending requests should remain scannable without competing for attention.

## Risks / Trade-offs

- **Long friend lists**: Client-side filtering works well for dozens of friends; if the list grows to hundreds, virtualisation or server-side search may be needed.
- **Pending visibility**: Moving requests below invites means incoming requests are no longer above the fold. A badge on the page title or navigation could mitigate this later.

## Open Questions

None.
