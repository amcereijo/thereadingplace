## Why

The Friends page currently buries the list of accepted friends below invite forms and pending requests. As the friend list grows, it becomes harder to quickly find a specific friend and view their shelf, which makes the primary social discovery flow feel secondary.

## What Changes

- Move the existing friends section to the top of the Friends page and make it visually prominent
- Add a live search/filter input on the friends list so a person can find a friend by username
- Keep all existing invite, new-member link, and pending-request flows in place
- Mark pending requests with a clear "Pending" label

## Capabilities

### New Capabilities
- `friend-search`: Filtering the accepted friends list by username

### Modified Capabilities
- `friendships`: Reorganizing the Friends page so existing friends are shown first and are easy to locate

## Impact

- `app/friends/page.tsx`: Reorder sections and add friend search UI
- `app/components/friends-list.tsx` (new): Filterable, prominent list of accepted friends
- `app/components/ui.tsx`: Reuses existing primitives, no new dependencies expected
- Server actions in `app/actions/friends.ts`: No API changes; existing listAcceptedFriends data source remains sufficient
