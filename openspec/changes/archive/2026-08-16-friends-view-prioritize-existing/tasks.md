## 1. FriendsList Component

- [x] 1.1 Create `app/components/friends-list.tsx` client component that accepts the accepted-friends array and renders a search input
- [x] 1.2 Filter the rendered friends by username substring (case-insensitive) as the user types, with an empty-state message when no match

## 2. Reorder Friends Page

- [x] 2.1 Update `app/friends/page.tsx` to render the accepted friends section first, using `FriendsList`
- [x] 2.2 Move invite-by-username, new-member link, incoming requests, and outgoing requests below the friends section

## 3. Visual Polish

- [x] 3.1 Make the accepted friends grid more prominent with larger cards and clear "View shelf" links
- [x] 3.2 Keep pending request lists compact and clearly labeled below the friends section

## 4. Verify

- [x] 4.1 Test that accepted friends render at the top of the page
- [x] 4.2 Test the search filter: matching substrings, no-match empty state, clearing restores the full list
- [x] 4.3 Confirm invite forms and pending request sections still work after reordering
