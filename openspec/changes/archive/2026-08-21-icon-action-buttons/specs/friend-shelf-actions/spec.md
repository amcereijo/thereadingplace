## MODIFIED Requirements

### Requirement: Copy book from friend's shelf
The system SHALL allow a signed-in viewer who can see a friend's shelf to copy any book on that shelf to their own shelf. The viewer MUST choose a status for the copied book. The system SHALL copy the title, formats, and note from the original book. The system MUST NOT copy dates, metadata, or the original book's id. The trigger that initiates the copy-to-shelf flow on a friend's book card SHALL be an icon-only button with a localized `aria-label`; the resulting dialog title, body, status selector, and submit/cancel buttons SHALL remain as visible text.

#### Scenario: Copy a book with status selection
- **WHEN** a viewer copies a friend's book and selects status `to-read`
- **THEN** the system creates a new book on the viewer's shelf with the same title, formats, and note, in status `to-read`
- **AND** the new book's `dateAdded` is set to the current date
- **AND** the new book has no `startedAt`, `finishedAt`, `abandonedAt`, or metadata

#### Scenario: Copy a book already on viewer's shelf
- **WHEN** a viewer copies a friend's book whose title already exists on the viewer's shelf
- **THEN** the system STILL creates a new book (duplicate titles are allowed)

#### Scenario: Viewer must select a status
- **WHEN** a viewer attempts to copy a book without selecting a status
- **THEN** the system MUST NOT create the book
- **AND** the system informs them that a status is required

#### Scenario: Add-to-shelf trigger is icon-only
- **WHEN** a viewer views a friend's book card
- **THEN** the action that initiates the copy-to-shelf flow is rendered as an icon-only button
- **AND** the button has a localized `aria-label` in the active locale
