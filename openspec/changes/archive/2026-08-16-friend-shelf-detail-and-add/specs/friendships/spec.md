## MODIFIED Requirements

### Requirement: Friend shelf views
The system SHALL provide the same view set for a friend's shelf as for the owner's shelf: an all-books view that can be filtered by status, and a dedicated view for each status. Each book card in a friend's shelf view SHALL include a "Details" button that opens a view showing all book properties (title, status, formats, dates, note, and metadata). Each book card SHALL also include an "Add to my shelf" button that initiates the copy-to-shelf flow.

#### Scenario: Friend all-books view
- **WHEN** a friend opens another friend's all-books view with no status filter
- **THEN** the system lists every book on that friend's shelf

#### Scenario: Friend status view
- **WHEN** a friend opens another friend's `reading` view
- **THEN** the system lists only that friend's books with status `reading`

#### Scenario: View book details
- **WHEN** a friend clicks the "Details" button on a book card
- **THEN** the system displays all properties of that book including title, status, formats, started/finished/abandoned dates, date added, note, and all metadata key-value pairs

#### Scenario: Initiate add to my shelf
- **WHEN** a friend clicks the "Add to my shelf" button on a book card
- **THEN** the system presents a status selector with the four shelf statuses
- **AND** upon selection the system copies the book to the viewer's shelf with the chosen status
