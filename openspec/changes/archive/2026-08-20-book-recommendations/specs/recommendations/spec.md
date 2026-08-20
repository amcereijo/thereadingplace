## Purpose

Lets a signed-in person recommend one of their own books to an accepted friend. Recommendations are sender-initiated and snapshotted at send-time so they survive any later edit or deletion of the source book. No sender action ever writes a book onto the receiver's shelf; the receiver owns acceptance and chooses the status.

## ADDED Requirements

### Requirement: Recommendation data model
The system SHALL store each recommendation as a single row containing `id`, `senderId`, `receiverId`, `bookId` (the source book id, kept as an audit pointer), `title`, `author`, `formatsJson`, `note`, `message` (the sender's optional personal note), `status` (`pending`, `accepted`, or `dismissed`), `sentAt`, `reply` (nullable, the receiver's optional response), `replyAt` (nullable), `acceptedAt` (nullable), and `dismissedAt` (nullable). The `title`, `author`, `formatsJson`, and `note` fields SHALL be snapshotted from the source book at send-time. If the source book is later deleted, the recommendation row SHALL remain, and `bookId` MAY be set to NULL via a foreign-key `ON DELETE SET NULL` rule; the snapshotted fields SHALL continue to drive all display and acceptance behavior. Duplicate recommendations of the same book to the same friend SHALL be allowed.

#### Scenario: Send a recommendation with snapshot
- **WHEN** a signed-in owner of a book submits a recommendation for an accepted friend
- **THEN** the system creates a row with `status = pending`, `sentAt = current timestamp`
- **AND** the row stores the title, author, formats, and note captured from the source book at that moment

#### Scenario: Send with an optional message
- **WHEN** a sender submits a recommendation that includes a personal note
- **THEN** the system stores the note in the recommendation's `message` field

#### Scenario: Send without a message
- **WHEN** a sender submits a recommendation without a personal note
- **THEN** the system stores the recommendation with `message` null or absent

#### Scenario: Source book deleted after recommendation
- **WHEN** the sender deletes the source book after sending a recommendation
- **THEN** the recommendation row is not deleted
- **AND** the row's snapshotted title, author, formats, and note remain available for display and acceptance
- **AND** `bookId` MAY be set to NULL by the database

#### Scenario: Duplicate recommendation to same friend
- **WHEN** a sender recommends the same book to the same friend twice
- **THEN** the system SHALL create a second pending recommendation row

### Requirement: Send a recommendation to an accepted friend
The system SHALL allow a signed-in person to send a recommendation for one of their own books to an accepted friend. The system SHALL require the receiver to be an accepted friend of the sender at send-time. The system SHALL require the sender to identify the receiver and MAY allow the sender to include an optional personal note. The system SHALL NOT send a recommendation to a non-friend or to oneself.

#### Scenario: Send to an accepted friend
- **WHEN** a signed-in owner picks one of their own books and an accepted friend and submits the recommendation form (with or without a message)
- **THEN** the system creates a pending recommendation row
- **AND** the receiver sees the recommendation on their `/recommendations` page

#### Scenario: Send to a non-friend is rejected
- **WHEN** a sender submits a recommendation with a receiver who is not an accepted friend of the sender
- **THEN** the system MUST NOT create a recommendation row
- **AND** the system informs the sender that the receiver is not a friend

#### Scenario: Send to oneself is rejected
- **WHEN** a sender submits a recommendation whose receiver is themselves
- **THEN** the system MUST NOT create a recommendation row
- **AND** the system informs the sender that self-recommendation is not allowed

#### Scenario: Send a book the sender does not own
- **WHEN** a sender submits a recommendation for a book they do not own
- **THEN** the system MUST NOT create a recommendation row
- **AND** the system informs the sender that the book was not found

### Requirement: No sender action ever writes to the receiver's shelf
The system MUST NOT provide any sender-initiated action that creates, edits, or deletes a book on the receiver's shelf. Acceptance of a recommendation SHALL be performed exclusively by the receiver; the recommendation row carries no privilege that bypasses this rule.

#### Scenario: Sender cannot add a book to receiver's shelf
- **WHEN** a sender sends a recommendation
- **THEN** the system MUST NOT create any book on the receiver's shelf as a result

#### Scenario: Acceptance is receiver-initiated
- **WHEN** the receiver clicks accept on a recommendation
- **THEN** the system creates the book on the receiver's shelf only because the receiver themselves performed the accept action
- **AND** the recommendation is marked `accepted` with `acceptedAt` set

### Requirement: Receiver sees recommendations on /recommendations
The system SHALL provide a `/recommendations` page reachable by signed-in users. The page SHALL contain two sections: a "received" section listing recommendations where the viewer is the receiver, and a "sent" section listing recommendations where the viewer is the sender. The system SHALL render both sections whenever the viewer has any recommendation row in either direction. Each row in the received section SHALL display the snapshotted title, the snapshotted author (if any), the snapshotted formats (if any), the sender's username, the sender's personal message (if any), the status, and the sent date. Each row in the sent section SHALL display the snapshotted title, the receiver's username, the message sent (if any), the status, and the sent date. All labels on the page SHALL be translated according to the active locale.

#### Scenario: Open /recommendations with received and sent
- **WHEN** a signed-in user with at least one received and at least one sent recommendation opens `/recommendations`
- **THEN** the system displays the received section and the sent section
- **AND** each row shows the snapshotted book fields, the counterparty's username, and any personal message

#### Scenario: Open /recommendations with only received
- **WHEN** a signed-in user with only received recommendations opens `/recommendations`
- **THEN** the system displays the received section
- **AND** the system MAY omit the sent section

#### Scenario: Open /recommendations with no recommendations
- **WHEN** a signed-in user with no recommendations in either direction opens `/recommendations`
- **THEN** the system SHALL display an empty state with a localized message
- **AND** the page SHALL remain accessible

### Requirement: Recommendations appear in the shelf navigation
The system SHALL display a `Recommendations` entry in the shelf navigation that already shows `All`, `To-Read`, `Reading`, `Read`, and `Abandoned`. The system SHALL render the entry only when the viewer has at least one recommendation row in either direction. The entry SHALL link to `/recommendations`. The entry label SHALL be translated according to the active locale.

#### Scenario: Recommendations entry shown
- **WHEN** a signed-in user with at least one recommendation row in either direction opens any shelf view
- **THEN** the system includes `Recommendations` in the shelf navigation

#### Scenario: Recommendations entry hidden
- **WHEN** a signed-in user with no recommendation rows opens any shelf view
- **THEN** the system SHALL NOT include `Recommendations` in the shelf navigation

### Requirement: Pending rows count as unread
The system SHALL treat any received recommendation where `status = pending` as unread for the receiver. The unread count surfaced on the shelf-nav `Recommendations` entry SHALL equal the number of rows where the viewer is the receiver and `status = pending`. The system SHALL NOT clear the unread state on render of `/recommendations`; the row SHALL remain unread until the receiver accepts or dismisses it. The system MAY keep the `seenAt` column on the table for audit but SHALL NOT use it to drive unread state.

#### Scenario: Unread count reflects pending recommendations
- **WHEN** a signed-in user has N received recommendations with `status = pending`
- **THEN** the `Recommendations` entry in the shelf-nav displays the badge with value N

#### Scenario: Unread count drops to zero only when no pending rows remain
- **WHEN** the receiver accepts or dismisses every pending recommendation they have received
- **THEN** the badge SHALL no longer be displayed on the `Recommendations` entry

#### Scenario: Visiting /recommendations does not clear unread
- **WHEN** a signed-in user with pending received recommendations visits `/recommendations`
- **THEN** the pending rows SHALL remain in `status = pending`
- **AND** the unread badge on the `Recommendations` entry SHALL continue to display the same count

### Requirement: Accept a recommendation
The system SHALL allow a signed-in receiver to accept a pending recommendation they received. Acceptance SHALL require the receiver to pick a status from `to-read`, `reading`, `read`, or `abandoned`. The system SHALL allow the receiver to attach an optional `reply` text message. On acceptance, the system SHALL create a new book on the receiver's shelf using the snapshotted title, author, formats, and note from the recommendation row, SHALL set the new book's status to the receiver's chosen status, SHALL set `dateAdded` to the current date, SHALL mark the recommendation `status = accepted` with `acceptedAt` set to the current timestamp, and SHALL store the reply (if any) along with `replyAt`. The new book SHALL have no `startedAt`, `finishedAt`, `abandonedAt`, or metadata. The acceptance action SHALL be performed by the receiver; no sender action SHALL trigger this behavior.

#### Scenario: Accept with status selection
- **WHEN** a receiver accepts a pending recommendation and selects status `to-read`
- **THEN** the system creates a new book on the receiver's shelf with the snapshotted title, author, formats, and note, in status `to-read`
- **AND** the new book's `dateAdded` is set to the current date
- **AND** the recommendation is marked `accepted` with `acceptedAt` set

#### Scenario: Accept with a reply
- **WHEN** a receiver accepts a pending recommendation and submits a reply
- **THEN** the system stores the reply text on the recommendation row
- **AND** the system sets `replyAt` to the current timestamp

#### Scenario: Accept without a reply
- **WHEN** a receiver accepts a pending recommendation without submitting a reply
- **THEN** the system stores `reply` as null and `replyAt` as null

#### Scenario: Accept without selecting a status
- **WHEN** a receiver attempts to accept a recommendation without selecting a status
- **THEN** the system MUST NOT create the book
- **AND** the system MUST NOT change the recommendation's status
- **AND** the system informs the receiver that a status is required

#### Scenario: Accept a recommendation whose source book was deleted
- **WHEN** a receiver accepts a recommendation whose source book has been deleted by the sender
- **THEN** the system creates the new book from the snapshotted fields on the recommendation row

#### Scenario: Accept a recommendation whose sender is no longer a friend
- **WHEN** a receiver accepts a recommendation where the sender and receiver are no longer accepted friends
- **THEN** the system SHALL still allow acceptance from the snapshotted fields
- **AND** the new book is created on the receiver's shelf as if the receiver had copied it themselves

### Requirement: Dismiss a recommendation
The system SHALL allow a signed-in receiver to dismiss a pending recommendation they received. The system SHALL allow the receiver to attach an optional `reply` text message at the moment of dismissal. Dismissal SHALL set `status = dismissed` and `dismissedAt` to the current timestamp, and SHALL store the reply (if any) along with `replyAt`. Dismissal SHALL NOT create any book on the receiver's shelf. The dismissed row SHALL remain visible on `/recommendations` as a memory of what was sent and dismissed.

#### Scenario: Dismiss a pending recommendation
- **WHEN** a receiver dismisses a pending recommendation
- **THEN** the system sets `status = dismissed` and `dismissedAt` to the current timestamp
- **AND** no book is created on the receiver's shelf

#### Scenario: Dismiss with a reply
- **WHEN** a receiver dismisses a pending recommendation and submits a reply
- **THEN** the system stores the reply text on the recommendation row
- **AND** the system sets `replyAt` to the current timestamp

#### Scenario: Dismiss without a reply
- **WHEN** a receiver dismisses a pending recommendation without submitting a reply
- **THEN** the system stores `reply` as null and `replyAt` as null

#### Scenario: Dismiss a non-pending recommendation
- **WHEN** a receiver attempts to dismiss an already-accepted or already-dismissed recommendation
- **THEN** the system SHALL NOT change the row's status
- **AND** the system informs the receiver that no action is available

### Requirement: Accepted and dismissed rows stay visible
The system SHALL continue to display accepted and dismissed recommendations on `/recommendations` for both sender and receiver. The system MAY render accepted and dismissed rows in a less prominent position than pending rows. The system SHALL NOT auto-delete a recommendation row under any circumstance other than a future explicit removal capability.

#### Scenario: Accepted row visible on both sides
- **WHEN** a recommendation has been accepted
- **THEN** the row appears in the sender's sent section as `accepted`
- **AND** the row appears in the receiver's received section as `accepted`

#### Scenario: Dismissed row visible on both sides
- **WHEN** a recommendation has been dismissed
- **THEN** the row appears in the sender's sent section as `dismissed`
- **AND** the row appears in the receiver's received section as `dismissed`

### Requirement: Sender sees the receiver's reply
When the receiver accepts or dismisses a recommendation with a `reply` text, the sender's view of that row on `/recommendations` SHALL display the reply beneath the original message, labeled as a response from the receiver. The reply SHALL be shown for accepted and dismissed rows alike; pending rows SHALL NOT have a reply.

#### Scenario: Sender sees an accepted reply
- **WHEN** a sender opens `/recommendations` and a recommendation they sent has been accepted with a `reply`
- **THEN** the row in the sent section shows the reply text alongside a "Response from @username" label

#### Scenario: Sender sees a dismissed reply
- **WHEN** a sender opens `/recommendations` and a recommendation they sent has been dismissed with a `reply`
- **THEN** the row in the sent section shows the reply text alongside a "Response from @username" label

#### Scenario: Sender sees no reply block on a pending row
- **WHEN** a sender opens `/recommendations` and a recommendation they sent is still `pending`
- **THEN** the row SHALL NOT show a reply block

### Requirement: No rescind after sending
The system SHALL NOT provide any action by which a sender can withdraw, rescind, retract, or delete a recommendation row after it has been sent. Once a recommendation is created, its row remains in the system indefinitely. A change in friendship status SHALL NOT delete existing recommendation rows.

#### Scenario: Sender attempts to rescind
- **WHEN** a sender attempts to retract a previously sent recommendation
- **THEN** the system SHALL provide no such action
- **AND** the recommendation row remains visible to both parties

#### Scenario: Friendship ends after sending
- **WHEN** a friendship between sender and receiver ends after a recommendation has been sent
- **THEN** the recommendation rows between them SHALL remain
- **AND** acceptance from the snapshotted fields SHALL remain possible for the receiver

### Requirement: Recommend from the owner's book list and book details
The system SHALL provide a `Recommend` action on the owner's all-books view and on each status-filtered view, and SHALL also provide a `Recommend` action on the owner's book edit/detail view. Both `Recommend` actions SHALL open the same panel that lets the sender pick an accepted friend and write an optional message. The system SHALL NOT provide a `Recommend` action on a friend's view of someone else's shelf.

#### Scenario: Recommend from the owner's book list
- **WHEN** the owner clicks `Recommend` on a book card in their own shelf view
- **THEN** the system opens the recommendation panel
- **AND** on submit the system sends a recommendation as defined by the send requirement

#### Scenario: Recommend from the owner's book edit view
- **WHEN** the owner clicks `Recommend` on their book edit/detail view
- **THEN** the system opens the recommendation panel
- **AND** on submit the system sends a recommendation as defined by the send requirement

#### Scenario: No Recommend action on a friend's shelf view
- **WHEN** a friend views another friend's shelf
- **THEN** the system SHALL NOT show a `Recommend` action on that friend's book cards
