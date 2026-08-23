# friend-screen-ux Specification

## Purpose
Defines how the friends management page is presented to a signed-in user — the three groups it shows, their order, the helper copy and empty states that orient the user, and the badge that surfaces the count of unanswered incoming friend requests on the side nav.

## Requirements

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

### Requirement: Invite a friend group shows both invite affordances
The Invite a friend group SHALL include both invite affordances: an **invite by username** form and a **new-member link** generator. The group SHALL also include one short sentence of helper copy in the active locale that tells the user the two ways they can grow their circle. The invite-by-username form SHALL appear before the new-member link generator within the group.

#### Scenario: Both invite affordances visible
- **WHEN** a signed-in person opens the friends management page
- **THEN** the Invite a friend group shows the invite-by-username form first
- **AND** the new-member link generator below it
- **AND** a short helper sentence appears in the active locale

### Requirement: Pending invitations shows received and sent side by side
The full Pending invitations block SHALL contain two sub-sections: **Received** (incoming pending requests) and **Sent** (outgoing pending requests). Each sub-section SHALL have its own heading in the active locale. The Received sub-section SHALL appear before the Sent sub-section. When a sub-section has no entries, the system SHALL show a short empty-state line in the active locale that tells the user what an entry in that sub-section would mean.

#### Scenario: Pending invitations has entries on both sides
- **WHEN** a signed-in person has one incoming and one outgoing pending request
- **THEN** the Pending invitations block shows both sub-sections
- **AND** the incoming request appears in Received with accept and decline actions
- **AND** the outgoing request appears in Sent with a pending tag

#### Scenario: Received sub-section is empty
- **WHEN** a signed-in person has no incoming pending requests
- **THEN** the Received sub-section shows a short empty-state line in the active locale

#### Scenario: Sent sub-section is empty
- **WHEN** a signed-in person has no outgoing pending requests
- **THEN** the Sent sub-section shows a short empty-state line in the active locale

#### Scenario: Both sub-sections are empty
- **WHEN** a signed-in person has no pending requests in either direction
- **THEN** both sub-sections show their empty-state lines in the active locale
- **AND** the Pending invitations block still appears on the page

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

### Requirement: Friends list as a filterable table
The system SHALL render the friends list as a dense table-like list: each accepted friend SHALL appear on a single row with the friend's avatar, `@username`, and a view-shelf action. The friends list SHALL include a single search input that filters rows by username in the active locale, case-insensitive, as the user types. Empty-state copy SHALL appear when no friends match. All visible copy SHALL be in the active locale.

#### Scenario: Filter the friends list
- **WHEN** a signed-in person types into the friends list search input
- **THEN** the list updates in place to show only friends whose username contains the typed text (case-insensitive)
- **AND** an empty-state line appears in the active locale when no friends match

#### Scenario: Many accepted friends
- **WHEN** a signed-in person has many accepted friends
- **THEN** each friend is shown on a single row
- **AND** the view-shelf action is reachable for every row
- **AND** the search input filters all rows in place

#### Scenario: No friends
- **WHEN** a signed-in person has no accepted friends
- **THEN** the friends list shows a short empty-state line in the active locale
- **AND** no search input is shown
