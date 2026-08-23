## Why

The top "Pending invitations preview" we just added to the friends page duplicates the full Pending invitations block and pulls the user's eye away from the friends list. The side-nav badge already shows the count of unanswered incoming requests and is the right place for that signal. We want the friends page to lead with the list of friends, with the full Pending invitations and Invite a friend blocks below.

## What Changes

- Remove the top "Pending invitations preview" section from the friends page. The full Pending invitations block below remains the canonical place to act on received requests.
- Restore the page to three sections in this order: (1) **Your friends** (the table), (2) **Pending invitations** (Received + Sent sub-sections), (3) **Invite a friend**.
- The side-nav badge for incoming pending requests stays as the only at-a-glance count of unanswered requests and continues to be the discovery path to the Pending invitations block.

## Capabilities

### Modified Capabilities
- `friend-screen-ux`: remove the "Pending invitations preview at the top" requirement, and change the page-order rule to the three-section order (Your friends, Pending invitations, Invite a friend). Keep the friends-table, invite-block, pending-block, and side-nav badge requirements.

## Impact

- `app/friends/page.tsx` — drop the `<PendingInvitationsPreview>` usage. Sections are now: Your friends table, Pending invitations (`id="pending-invitations"`), Invite a friend (`id="invite-a-friend"`).
- `app/components/pending-invitations-preview.tsx` — deleted.
- `lib/i18n/en.json` and `lib/i18n/es.json` — remove unused keys: `pendingSummaryTitle`, `topNone`, `topMore`, `viewAll`, `viewAllCount`, `inviteFriendLink`.
- `app/components/side-nav.tsx` — unchanged. The badge still appears on every page except `/friends`.
- `app/layout.tsx` — unchanged. `incomingPendingRequests` is still fetched and passed through.
