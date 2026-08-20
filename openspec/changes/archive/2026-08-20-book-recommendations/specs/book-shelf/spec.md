## MODIFIED Requirements

### Requirement: Own-shelf views
The system SHALL provide the owner an all-books view that can be filtered by status, and a dedicated view for each status (`to-read`, `reading`, `read`, `abandoned`). Each status view SHALL list only books in that status. Only the owner and accepted friends can see these views; friend visibility is defined by the friendships capability. When a book has an `author` value, each view SHALL display the author alongside the title. The home route (`/`) SHALL serve the owner's shelf view when the visitor is signed in, and the public landing page when the visitor is not signed in. All labels and navigation text in these views SHALL be translated according to the active locale. Each book card in the owner's all-books view and each status-filtered owner view SHALL include a `Recommend` action that opens the recommendation panel defined by the recommendations capability.

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

## ADDED Requirements

### Requirement: Recommend from the owner's book edit view
The system SHALL provide a `Recommend` action on the owner's book edit/detail view. The action SHALL open the same recommendation panel used by the book list, and SHALL NOT submit the edit form when invoked.

#### Scenario: Click Recommend from edit view
- **WHEN** the owner clicks `Recommend` on their book edit/detail view
- **THEN** the system opens the recommendation panel
- **AND** the edit form is not submitted
