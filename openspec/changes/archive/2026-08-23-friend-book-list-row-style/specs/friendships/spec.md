## MODIFIED Requirements

### Requirement: Friend shelf views
The system SHALL provide the same view set for a friend's shelf as for the owner's shelf: an all-books view that can be filtered by status, and a dedicated view for each status. Each book card in a friend's shelf view SHALL render as a compact row that shows only the book title with author (when present), the status badge, the single most recent meaningful date using the localized label for that date kind (`Finished`, `Started`, `Abandoned`, or `Added`), and the existing icon-only row actions (`Details`, `Add to my shelf`). The compact row MUST NOT display formats, every meaningful date, or a note preview by default. Each book card SHALL include a "Details" button that opens a view showing all book properties (title, status, formats, dates, note, and metadata). Each book card SHALL also include an "Add to my shelf" button that initiates the copy-to-shelf flow. The labels for these actions and the status labels SHALL be translated according to the active locale. The "Details" and "Add to my shelf" actions on a friend's book card SHALL render as icon-only buttons with localized `aria-label`s. The compact row shape on a friend's card SHALL match the compact row shape on the owner's card so the two audiences see the same surface; the disclosure content revealed by the `Details` toggle SHALL be identical for both audiences.

#### Scenario: Friend all-books view
- **WHEN** a friend opens another friend's all-books view with no status filter
- **THEN** the system lists every book on that friend's shelf
- **AND** labels are shown in the active locale
- **AND** each card renders the compact row (title + author, status badge, single labeled last meaningful date, icon-only `Details` and `Add to my shelf` actions)
- **AND** the card does NOT display formats, every meaningful date, or a note preview by default

#### Scenario: Friend status view
- **WHEN** a friend opens another friend's `reading` view
- **THEN** the system lists only that friend's books with status `reading`
- **AND** the status label is shown in the active locale
- **AND** each card renders the compact row (title + author, status badge, single labeled last meaningful date, icon-only `Details` and `Add to my shelf` actions)

#### Scenario: Friend card shows last meaningful date with localized label
- **WHEN** a friend views a friend's book card on any friend shelf view
- **THEN** the compact row displays a single date line using the most recent of `finished_at`, `started_at`, `abandoned_at`, `date_added`, each rendered with its localized label from the active locale dictionary
- **AND** formats, every meaningful date, and any note preview are NOT visible by default

#### Scenario: Friend card missing dates falls back to date added
- **WHEN** a friend views a friend's book card whose book has no `finished_at`, `started_at`, or `abandoned_at`
- **THEN** the compact row displays the `Added` date with its localized label

#### Scenario: View book details
- **WHEN** a friend activates the details action on a book card
- **THEN** the system displays all properties of that book including title, status, formats, started/finished/abandoned dates, date added, note, and all metadata key-value pairs
- **AND** property labels are shown in the active locale

#### Scenario: Initiate add to my shelf
- **WHEN** a friend activates the add-to-shelf action on a book card
- **THEN** the system presents a status selector with the four shelf statuses
- **AND** upon selection the system copies the book to the viewer's shelf with the chosen status
- **AND** the selector labels are shown in the active locale

#### Scenario: Friend view actions are icon-only
- **WHEN** a friend views another friend's book card
- **THEN** the `Details` and `Add to my shelf` actions render as icon-only buttons
- **AND** each icon-only button has a localized `aria-label` in the active locale
