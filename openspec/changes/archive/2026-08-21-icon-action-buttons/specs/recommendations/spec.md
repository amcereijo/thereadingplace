## MODIFIED Requirements

### Requirement: Accept a recommendation
The system SHALL allow a signed-in receiver to accept a pending recommendation they received. Acceptance SHALL require the receiver to pick a status from `to-read`, `reading`, `read`, or `abandoned`. The system SHALL allow the receiver to attach an optional `reply` text message. On acceptance, the system SHALL create a new book on the receiver's shelf using the snapshotted title, author, formats, and note from the recommendation row, SHALL set the new book's status to the receiver's chosen status, SHALL set `dateAdded` to the current date, SHALL mark the recommendation `status = accepted` with `acceptedAt` set to the current timestamp, and SHALL store the reply (if any) along with `replyAt`. The new book SHALL have no `startedAt`, `finishedAt`, `abandonedAt`, or metadata. The acceptance action SHALL be performed by the receiver; no sender action SHALL trigger this behavior. The trigger that opens the accept dialog on a recommendation row SHALL render as an icon-only button with a localized `aria-label`; the dialog's submit and cancel buttons SHALL remain visible text.

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

#### Scenario: Accept trigger is icon-only
- **WHEN** a pending recommendation row is rendered on `/recommendations`
- **THEN** the action that opens the accept dialog is an icon-only button
- **AND** the button has a localized `aria-label` in the active locale

### Requirement: Dismiss a recommendation
The system SHALL allow a signed-in receiver to dismiss a pending recommendation they received. The system SHALL allow the receiver to attach an optional `reply` text message at the moment of dismissal. Dismissal SHALL set `status = dismissed` and `dismissedAt` to the current timestamp, and SHALL store the reply (if any) along with `replyAt`. Dismissal SHALL NOT create any book on the receiver's shelf. The dismissed row SHALL remain visible on `/recommendations` as a memory of what was sent and dismissed. The trigger that opens the dismiss dialog on a recommendation row SHALL render as an icon-only button with a localized `aria-label`; the dialog's submit and cancel buttons SHALL remain visible text.

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

#### Scenario: Dismiss trigger is icon-only
- **WHEN** a pending recommendation row is rendered on `/recommendations`
- **THEN** the action that opens the dismiss dialog is an icon-only button
- **AND** the button has a localized `aria-label` in the active locale

### Requirement: Recommend from the owner's book list and book details
The system SHALL provide a `Recommend` action on the owner's all-books view and on each status-filtered view, and SHALL also provide a `Recommend` action on the owner's book edit/detail view. Both `Recommend` actions SHALL open the same panel that lets the sender pick an accepted friend and write an optional message. The system SHALL NOT provide a `Recommend` action on a friend's view of someone else's shelf. The `Recommend` action on each owner-facing surface SHALL render as an icon-only button with a localized `aria-label`; the dialog's submit and cancel buttons SHALL remain visible text.

#### Scenario: Recommend from the owner's book list
- **WHEN** the owner activates the `Recommend` action on a book card in their own shelf view
- **THEN** the system opens the recommendation panel
- **AND** on submit the system sends a recommendation as defined by the send requirement

#### Scenario: Recommend from the owner's book edit view
- **WHEN** the owner activates the `Recommend` action on their book edit/detail view
- **THEN** the system opens the recommendation panel
- **AND** on submit the system sends a recommendation as defined by the send requirement

#### Scenario: No Recommend action on a friend's shelf view
- **WHEN** a friend views another friend's shelf
- **THEN** the system SHALL NOT show a `Recommend` action on that friend's book cards
