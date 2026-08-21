## Purpose

Lets people become friends by username or a one-shot new-member link, and restricts every shelf so only the owner and accepted friends can see the books.

## Requirements

### Requirement: Username invite requires accept
The system SHALL allow a signed-in person with a username to invite another existing account by that account's username. The invite SHALL create a pending request. The invitee MUST accept before the two accounts are friends. Knowing a username MUST NOT grant shelf access.

#### Scenario: Send a username invite
- **WHEN** a signed-in person invites an existing username that is not already a friend or pending with them
- **THEN** the system creates a pending friend request from inviter to invitee
- **AND** neither person can see the other's books yet

#### Scenario: Invitee accepts
- **WHEN** the invitee accepts a pending request
- **THEN** the two accounts become friends
- **AND** each can see the other's shelf

#### Scenario: Invitee declines
- **WHEN** the invitee declines a pending request
- **THEN** the system removes the pending request
- **AND** neither person can see the other's books

#### Scenario: Unknown username
- **WHEN** a signed-in person invites a username that does not exist
- **THEN** the system MUST NOT create a request
- **AND** the system informs them that the username was not found

### Requirement: One-shot new-member link
The system SHALL allow a signed-in person with a username to create a one-shot new-member link. When an unauthenticated person completes signup through that unused link, the system SHALL create their account, require them to choose a username, make the two accounts friends, and mark the link used. A used link MUST NOT friend anyone else.

#### Scenario: New person signs up through an unused link
- **WHEN** an unauthenticated person completes signup through an unused new-member link and then claims a username
- **THEN** their account and the link creator's account are friends
- **AND** the link cannot be used again

#### Scenario: Used link is rejected
- **WHEN** a person opens a new-member link that has already been used
- **THEN** the system MUST NOT create a friendship
- **AND** the system informs them that the link is no longer valid

### Requirement: Existing account cannot use a new-member link
The system MUST reject a one-shot new-member link when the person opening it already has an account. The system MUST NOT consume the link in that case.

#### Scenario: Signed-in person opens a new-member link
- **WHEN** a signed-in person opens an unused new-member link
- **THEN** the system MUST NOT create a friendship
- **AND** the link remains unused

#### Scenario: Existing identity signs up through a new-member link
- **WHEN** a person who already has an account tries to complete signup through an unused new-member link
- **THEN** the system MUST NOT create a second account
- **AND** the system MUST NOT create a friendship
- **AND** the link remains unused

### Requirement: Friends-only shelf access
The system SHALL show a person's books only to that person and to accounts that are accepted friends with them. A pending request MUST NOT grant shelf access. The system MAY confirm that a username exists without showing any books.

#### Scenario: Friend can see a shelf
- **WHEN** an accepted friend opens another friend's all-books view or a status view
- **THEN** the system lists that friend's books for the requested view

#### Scenario: Non-friend cannot see books
- **WHEN** a signed-in person who is not an accepted friend of `@maria` requests `@maria`'s shelf
- **THEN** the system MUST NOT show `@maria`'s books

#### Scenario: Username existence without books
- **WHEN** a signed-in person looks up an existing username they are not friends with
- **THEN** the system MAY indicate that the username exists
- **AND** the system MUST NOT show that account's books

### Requirement: Friend shelf views
The system SHALL provide the same view set for a friend's shelf as for the owner's shelf: an all-books view that can be filtered by status, and a dedicated view for each status. Each book card in a friend's shelf view SHALL include a "Details" button that opens a view showing all book properties (title, status, formats, dates, note, and metadata). Each book card SHALL also include an "Add to my shelf" button that initiates the copy-to-shelf flow. The labels for these actions and the status labels SHALL be translated according to the active locale. The "Details" and "Add to my shelf" actions on a friend's book card SHALL render as icon-only buttons with localized `aria-label`s.

#### Scenario: Friend all-books view
- **WHEN** a friend opens another friend's all-books view with no status filter
- **THEN** the system lists every book on that friend's shelf
- **AND** labels are shown in the active locale

#### Scenario: Friend status view
- **WHEN** a friend opens another friend's `reading` view
- **THEN** the system lists only that friend's books with status `reading`
- **AND** the status label is shown in the active locale

#### Scenario: View book details
- **WHEN** a friend activates the details action on a book card
- **THEN** the system displays all properties of that book including title, status, formats, started/finished/abandoned dates, date added, note, and all metadata key-value pairs
- **AND** property labels are shown in the active locale

#### Scenario: Initiate add to my shelf
- **WHEN** a friend activates the add-to-shelf action on a book card
- **THEN** the system presents a status selector with the four shelf statuses
- **AND** upon selection the system copies the book to the viewer's shelf with the chosen status
- **AND** the selector labels are shown in the active locale

#### Scenario: Friend view actions are icon-only
- **WHEN** a friend views another friend's book card
- **THEN** the `Details` and `Add to my shelf` actions render as icon-only buttons
- **AND** each icon-only button has a localized `aria-label` in the active locale

### Requirement: No ending a friendship in v1
The system MUST NOT provide a way for either person to end an accepted friendship.

#### Scenario: Friend cannot unfriend
- **WHEN** either friend of an accepted pair attempts to end the friendship
- **THEN** the system MUST leave the friendship in place
- **AND** both people keep access to each other's shelves

### Requirement: Friends management page prioritizes existing friends
The system SHALL display the accepted friends section first on the friends management page, before invite forms and pending requests. The accepted friends list SHALL be visually distinct and easy to scan. Pending requests SHALL be grouped below and clearly labeled as pending. All labels and actions on the friends page SHALL be translated according to the active locale. Each accepted-friend card SHALL include a `View shelf` action rendered as an icon-only link with a localized `aria-label` so the action is dense but remains announceable.

#### Scenario: Open friends page
- **WHEN** a signed-in person opens the friends management page
- **THEN** the system shows the accepted friends section at the top
- **AND** invite forms and pending requests appear below it
- **AND** all labels are shown in the active locale

#### Scenario: Many accepted friends
- **WHEN** a signed-in person has several accepted friends
- **THEN** the accepted friends section remains at the top of the page
- **AND** each friend has a clear link to view their shelf
- **AND** the link text is shown in the active locale

#### Scenario: View shelf is icon-only on friend cards
- **WHEN** an accepted-friend card is rendered on the friends page
- **THEN** the `View shelf` action is an icon-only link
- **AND** the link has a localized `aria-label` in the active locale
