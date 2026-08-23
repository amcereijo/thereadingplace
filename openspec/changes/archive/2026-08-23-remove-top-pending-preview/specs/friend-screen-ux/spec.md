## MODIFIED Requirements

### Requirement: Three-group page layout
The system SHALL render the friends management page as three visually distinct sections, in this order: (1) **Your friends**, (2) **Pending invitations**, (3) **Invite a friend**. Each section SHALL have a heading and SHALL be visually separated from the others so a user can locate each concern by scrolling. All group titles and helper copy SHALL be translated according to the active locale.

#### Scenario: Open friends page with all three groups
- **WHEN** a signed-in person opens the friends management page
- **THEN** the page shows the three sections in order: Your friends, Pending invitations, Invite a friend
- **AND** each section has its own heading in the active locale

#### Scenario: Empty state for Your friends
- **WHEN** a signed-in person with no accepted friends opens the friends management page
- **THEN** the Your friends section shows an empty-state line in the active locale
- **AND** the Pending invitations and Invite a friend sections still appear below it

### Requirement: Friends nav badge for incoming pending requests
The system SHALL show a badge on the "Friends" item in the side nav whose value is the count of incoming (received) pending friend requests the signed-in user has not yet answered. The badge SHALL be hidden when the count is zero. The badge SHALL be hidden while the user is on the friends management page so the count is not visible in the very place where it is being addressed. The badge SHALL include a localized `aria-label` that announces the count in the active locale so screen-reader users hear the number.

#### Scenario: Incoming requests exist
- **WHEN** a signed-in person has two incoming pending friend requests and is not on the friends management page
- **THEN** the Friends item in the side nav shows a badge with the number 2
- **AND** the badge has a localized `aria-label` in the active locale that announces the count

#### Scenario: No incoming requests
- **WHEN** a signed-in person has zero incoming pending friend requests
- **THEN** the Friends item in the side nav shows no badge

#### Scenario: User is on the friends page
- **WHEN** a signed-in person with incoming pending friend requests is viewing the friends management page
- **THEN** the Friends item in the side nav shows no badge
- **AND** the count is still visible on the page itself (in the Pending invitations block)

## REMOVED Requirements

### Requirement: Pending invitations preview at the top
**Reason**: The top-of-page preview duplicated the full Pending invitations block and pulled attention away from the friends list. The side-nav badge is the at-a-glance indicator of how many incoming pending requests the user has not yet answered, so the preview is no longer needed for discoverability.
**Migration**: Users who relied on the preview to act on requests can still do so in the Pending invitations block on the same page. The side-nav badge on the Friends item continues to surface the unanswered-request count on every other page.
