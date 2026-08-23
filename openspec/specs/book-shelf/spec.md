## Purpose

Lets a signed-in person keep a personal list of books with status, formats, optional dates, and a single note, and browse that list as all books or by status.

## Requirements

### Requirement: Create a book in any status
The system SHALL allow the owner to create a book in any of these statuses: `to-read`, `reading`, `read`, `abandoned`. Title is the only required field. Formats, `started_at`, `finished_at`, `abandoned_at`, and the note MAY be omitted.

#### Scenario: Create with only a title
- **WHEN** the owner submits a new book with a non-empty title and a status, and no other fields
- **THEN** the system stores the book on their shelf in that status

#### Scenario: Title is required
- **WHEN** the owner submits a new book with an empty title
- **THEN** the system MUST NOT store the book
- **AND** the system informs them that a title is required

#### Scenario: Create into Read
- **WHEN** the owner submits a new book with a title and status `read`
- **THEN** the system stores the book as `read` without requiring dates, formats, or a note

### Requirement: Move a book to any status
The system SHALL allow the owner to change a book's status from any status to any other status among `to-read`, `reading`, `read`, and `abandoned`.

#### Scenario: Move from To Read to Abandoned
- **WHEN** the owner changes a `to-read` book to `abandoned`
- **THEN** the system stores the book as `abandoned`

#### Scenario: Move from Read back to Reading
- **WHEN** the owner changes a `read` book to `reading`
- **THEN** the system stores the book as `reading`

### Requirement: Dates stay empty unless the owner sets them
The system MUST NOT write `started_at`, `finished_at`, or `abandoned_at` as a side effect of creating a book or changing its status. The owner MAY set, change, or clear those fields independently of status.

#### Scenario: Status change does not stamp a date
- **WHEN** the owner moves a book to `reading`, `read`, or `abandoned` without submitting a date
- **THEN** the corresponding date field remains empty

#### Scenario: Owner sets a date
- **WHEN** the owner sets `finished_at` on a book
- **THEN** the system stores that date
- **AND** the book's status is unchanged unless the owner also changes status

### Requirement: Many formats per book
The system SHALL allow a book to have zero or more formats. Allowed formats are `paperback`, `hardcover`, `ebook`, and `audiobook`. The owner MAY add or remove formats at any time.

#### Scenario: Add multiple formats
- **WHEN** the owner sets a book's formats to `paperback` and `ebook`
- **THEN** the system stores both formats on that book

#### Scenario: Book with no formats
- **WHEN** the owner creates or edits a book without choosing a format
- **THEN** the system stores the book with an empty format list

### Requirement: Single editable note
The system SHALL store at most one note per book. The owner MAY set, replace, or clear that note at any time.

#### Scenario: Add a note
- **WHEN** the owner saves a note on a book that had none
- **THEN** the system stores that note on the book

#### Scenario: Edit a note
- **WHEN** the owner saves a different note on a book that already has one
- **THEN** the system replaces the previous note with the new text

### Requirement: Delete own book
The system SHALL allow the owner to delete a book from their shelf. After deletion the book MUST NOT appear on any of their views.

#### Scenario: Owner deletes a book
- **WHEN** the owner deletes a book
- **THEN** the system removes it from their shelf
- **AND** the book no longer appears on the all-books view or any status view

### Requirement: Own-shelf views
The system SHALL provide the owner an all-books view that can be filtered by status, and a dedicated view for each status (`to-read`, `reading`, `read`, `abandoned`). Each status view SHALL list only books in that status. Only the owner and accepted friends can see these views; friend visibility is defined by the friendships capability. When a book has an `author` value, each view SHALL display the author alongside the title. The home route (`/`) SHALL serve the owner's shelf view when the visitor is signed in, and the public landing page when the visitor is not signed in. All labels and navigation text in these views SHALL be translated according to the active locale. Each book card in the owner's all-books view and each status-filtered owner view SHALL include a `Recommend` action that opens the recommendation panel defined by the recommendations capability. The owner-facing row actions on each book card (`Change status`, `Edit`, `Recommend`, `Delete`) SHALL render as icon-only buttons with localized `aria-label`s so the actions are dense, recognizable, and announced to assistive technology in the active locale.

#### Scenario: All-books view lists every book
- **WHEN** the owner opens the all-books view with no status filter
- **THEN** the system lists every book on their shelf
- **AND** books with an author display the author next to the title
- **AND** page labels are shown in the active locale
- **AND** each book card displays a `Recommend` action

#### Scenario: Filter all-books by status
- **WHEN** the owner applies a status filter of `reading` on the all-books view
- **THEN** the system lists only their books with status `reading`
- **AND** books with an author display the author next to the title
- **AND** status labels are shown in the active locale
- **AND** each book card displays a `Recommend` action

#### Scenario: Dedicated status view
- **WHEN** the owner opens the `to-read` view
- **THEN** the system lists only their books with status `to-read`
- **AND** books with an author display the author next to the title
- **AND** the status label is shown in the active locale
- **AND** each book card displays a `Recommend` action

#### Scenario: Signed-in user sees shelf on home route
- **WHEN** a signed-in user opens `/`
- **THEN** the system displays their shelf view in the active locale
- **AND** each book card on the owner's view displays a `Recommend` action

#### Scenario: Signed-out visitor sees landing page on home route
- **WHEN** a visitor who is not signed in opens `/`
- **THEN** the system displays the public landing page in the active locale

#### Scenario: Owner row actions are icon-only
- **WHEN** the owner views any of their own shelf views
- **THEN** each book card displays `Change status`, `Edit`, `Recommend`, and `Delete` as icon-only buttons
- **AND** each icon-only button has a localized `aria-label` in the active locale

### Requirement: Compact owner book card with details toggle
The system SHALL render each owner-facing book card (all-books view and each owner status view) as a compact row that shows only the book title with author (when present), the status badge, the single most recent meaningful date using the localized label for that date kind (`Finished`, `Started`, `Abandoned`, or `Added`), and the existing icon-only row actions (`Change status`, `Edit`, `Recommend`, `Delete`). The compact row MUST NOT display formats, every meaningful date, or a note preview by default. The system SHALL provide an icon-only `Show details` toggle button on each owner card that opens a disclosure of formats (when present), every meaningful date with its localized label and value, the note (when present), and any imported metadata; activating the toggle a second time SHALL collapse the disclosure back to the compact row. The toggle's `aria-label` and icon MUST be localized through the active locale dictionary, and the disclosure content MUST remain keyboard reachable.

#### Scenario: Compact owner card shows title, author, status, last meaningful date, and row actions
- **WHEN** the owner views the all-books view or any owner status view
- **THEN** each book card displays the title and author (when present), the status badge, a single date line with the most recent of `finished_at`, `started_at`, `abandoned_at`, `date_added` (each rendered with its localized label)
- **AND** each card displays the existing `Change status`, `Edit`, `Recommend`, and `Delete` icon-only actions
- **AND** the card does NOT display the formats list, every meaningful date, or a note preview by default

#### Scenario: Owner expands details
- **WHEN** the owner activates the `Show details` toggle on a card
- **THEN** the card reveals a disclosure that lists formats (when present), every meaningful date with its localized label and value, the note (when present), and any imported metadata
- **AND** the disclosure content is keyboard reachable

#### Scenario: Owner collapses details
- **WHEN** the owner activates the toggle again on a card whose disclosure is open
- **THEN** the disclosure collapses back to the compact row
- **AND** the toggle's `aria-label` reverts to the localized `Show details` text

#### Scenario: Missing dates fall back to date added
- **WHEN** a book has no `finished_at`, `started_at`, or `abandoned_at`
- **THEN** the compact row shows the `Added` date with the book title, author, status, and row actions

#### Scenario: Friend view is unchanged
- **WHEN** an accepted friend views the owner's shelf
- **THEN** the owner-facing compact card and new toggle are not rendered
- **AND** the friend sees the existing friend-view card unchanged

### Requirement: Recommend from the owner's book edit view
The system SHALL provide a `Recommend` action on the owner's book edit/detail view. The action SHALL open the same recommendation panel used by the book list, and SHALL NOT submit the edit form when invoked.

#### Scenario: Click Recommend from edit view
- **WHEN** the owner clicks `Recommend` on their book edit/detail view
- **THEN** the system opens the recommendation panel
- **AND** the edit form is not submitted
