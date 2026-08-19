## Purpose

Lets people become friends by username or a one-shot new-member link, and restricts every shelf so only the owner and accepted friends can see the books.

## MODIFIED Requirements

### Requirement: Friends management page prioritizes existing friends
The system SHALL display the accepted friends section first on the friends management page, before invite forms and pending requests. The accepted friends list SHALL be visually distinct and easy to scan. Pending requests SHALL be grouped below and clearly labeled as pending. All labels and actions on the friends page SHALL be translated according to the active locale.

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

### Requirement: Friend shelf views
The system SHALL provide the same view set for a friend's shelf as for the owner's shelf: an all-books view that can be filtered by status, and a dedicated view for each status. Each book card in a friend's shelf view SHALL include a "Details" button that opens a view showing all book properties (title, status, formats, dates, note, and metadata). Each book card SHALL also include an "Add to my shelf" button that initiates the copy-to-shelf flow. The labels for these actions and the status labels SHALL be translated according to the active locale.

#### Scenario: Friend all-books view
- **WHEN** a friend opens another friend's all-books view with no status filter
- **THEN** the system lists every book on that friend's shelf
- **AND** labels are shown in the active locale

#### Scenario: Friend status view
- **WHEN** a friend opens another friend's `reading` view
- **THEN** the system lists only that friend's books with status `reading`
- **AND** the status label is shown in the active locale

#### Scenario: View book details
- **WHEN** a friend clicks the details action on a book card
- **THEN** the system displays all properties of that book including title, status, formats, started/finished/abandoned dates, date added, note, and all metadata key-value pairs
- **AND** property labels are shown in the active locale

#### Scenario: Initiate add to my shelf
- **WHEN** a friend clicks the add-to-shelf action on a book card
- **THEN** the system presents a status selector with the four shelf statuses
- **AND** upon selection the system copies the book to the viewer's shelf with the chosen status
- **AND** the selector labels are shown in the active locale
