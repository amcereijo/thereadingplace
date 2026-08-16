## MODIFIED Requirements

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
