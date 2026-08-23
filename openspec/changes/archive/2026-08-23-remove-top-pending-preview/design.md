## Context

The previous change `friends-page-reorder-and-table` added a top-of-page preview that listed up to 3 incoming pending requests with a "View all" anchor and an "Invite a friend" anchor. In practice the preview duplicates the full Pending invitations block immediately below it, and pulls the eye away from the friends list. The side-nav badge (added in the change before that) already shows the count of unanswered incoming requests, so the preview is redundant for discoverability. The friends page should lead with the friends list.

## Goals / Non-Goals

**Goals:**
- Remove the top pending preview from the friends page.
- Restore the page to three sections in this order: Your friends, Pending invitations, Invite a friend.
- Keep the side-nav badge as the at-a-glance count of unanswered incoming requests.

**Non-Goals:**
- No data model changes.
- No changes to actions (accept/decline, view shelf, invite).
- No changes to the friends table or the side-nav badge.
- No new affordance to replace the preview — the count is in the side-nav badge, the canonical action surface is the Pending invitations block.

## Decisions

### 1. Drop the preview component entirely
Delete `app/components/pending-invitations-preview.tsx`. It is no longer imported anywhere. The only places that referenced its i18n keys are removed in step 2.

**Alternatives considered:**
- *Keep the preview but render it as a single empty-state line* — keeps duplication, and the user explicitly asked to remove the section.
- *Move the preview into the side-nav as an expandable popover* — out of scope; the side-nav already has the badge for the count.

### 2. Drop only the preview's i18n keys
Remove `pendingSummaryTitle`, `topNone`, `topMore`, `viewAll`, `viewAllCount`, `inviteFriendLink` from both dictionaries. Keep `pendingInvitations`, `received`, `receivedNone`, `sent`, `sentNone`, `pending`, `pendingRequestsAria` (still used by the bottom block and the side-nav badge). Keep `friendsTableHeaderName`, `friendsTableHeaderAction`, `friendsCount` (still used by the friends table).

### 3. Page order
Restore the section order: Your friends (with `<SectionTitle>`), Pending invitations (with `id="pending-invitations"`), Invite a friend (with `id="invite-a-friend"`). No other layout change.

## Risks / Trade-offs

- [Users who used the preview as a quick triage surface lose it] → Mitigation: the side-nav badge is visible on every page except `/friends`, and the bottom Pending invitations block is the canonical action surface. Triaging is one click deeper.
- [Removing the preview is a behavior change vs. the most recent spec] → Mitigation: this change ships with a spec delta that removes the requirement and updates the page-order rule.

## Migration Plan

No data migration. Reverting the change means re-creating the preview component and restoring the deleted i18n keys. The two dictionary files and the page file are the only artifacts touched.

## Open Questions

None.
