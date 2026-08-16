## Purpose

Lets a signed-in person keep a personal list of books with status, formats, optional dates, and a single note, and browse that list as all books or by status.

## ADDED Requirements

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
The system SHALL provide the owner an all-books view that can be filtered by status, and a dedicated view for each status (`to-read`, `reading`, `read`, `abandoned`). Each status view SHALL list only books in that status. Only the owner and accepted friends can see these views; friend visibility is defined by the friendships capability. When a book has an `author` value, each view SHALL display the author alongside the title.

#### Scenario: All-books view lists every book
- **WHEN** the owner opens the all-books view with no status filter
- **THEN** the system lists every book on their shelf
- **AND** books with an author display the author next to the title

#### Scenario: Filter all-books by status
- **WHEN** the owner applies a status filter of `reading` on the all-books view
- **THEN** the system lists only their books with status `reading`
- **AND** books with an author display the author next to the title

#### Scenario: Dedicated status view
- **WHEN** the owner opens the `to-read` view
- **THEN** the system lists only their books with status `to-read`
- **AND** books with an author display the author next to the title
