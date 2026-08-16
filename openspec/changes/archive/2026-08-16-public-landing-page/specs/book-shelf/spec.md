## MODIFIED Requirements

### Requirement: Own-shelf views
The system SHALL provide the owner an all-books view that can be filtered by status, and a dedicated view for each status (`to-read`, `reading`, `read`, `abandoned`). Each status view SHALL list only books in that status. Only the owner and accepted friends can see these views; friend visibility is defined by the friendships capability. When a book has an `author` value, each view SHALL display the author alongside the title. The home route (`/`) SHALL serve the owner's shelf view when the visitor is signed in, and the public landing page when the visitor is not signed in.

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

#### Scenario: Signed-in user sees shelf on home route
- **WHEN** a signed-in user opens `/`
- **THEN** the system displays their shelf view

#### Scenario: Signed-out visitor sees landing page on home route
- **WHEN** a visitor who is not signed in opens `/`
- **THEN** the system displays the public landing page
