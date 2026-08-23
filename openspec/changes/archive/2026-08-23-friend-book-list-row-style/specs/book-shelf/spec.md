## MODIFIED Requirements

### Requirement: Compact owner book card with details toggle
The system SHALL render each owner-facing book card (all-books view and each owner status view) as a compact row that shows only the book title with author (when present), the status badge, the single most recent meaningful date using the localized label for that date kind (`Finished`, `Started`, `Abandoned`, or `Added`), and the existing icon-only row actions (`Change status`, `Edit`, `Recommend`, `Delete`). The compact row MUST NOT display formats, every meaningful date, or a note preview by default. The system SHALL provide an icon-only `Show details` toggle button on each owner card that opens a disclosure of formats (when present), every meaningful date with its localized label and value, the note (when present), and any imported metadata; activating the toggle a second time SHALL collapse the disclosure back to the compact row. The toggle's `aria-label` and icon MUST be localized through the active locale dictionary, and the disclosure content MUST remain keyboard reachable. The friend-facing book card SHALL render the same compact row shape (title + author, status badge, single labeled last meaningful date, icon-only row actions — `Details`, `Add to my shelf`) so the two audiences share one visible card surface; the friend card's existing `Details` toggle continues to open the same disclosure and the disclosure content SHALL be identical for both audiences.

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

#### Scenario: Friend view shares the compact row shape
- **WHEN** an accepted friend views the owner's shelf
- **THEN** the owner-facing compact card and new toggle are not rendered
- **AND** the friend sees the friend-view card, which renders the same compact row shape (title + author, status badge, single labeled last meaningful date, icon-only `Details` and `Add to my shelf` actions)
- **AND** the friend card does NOT display formats, every meaningful date, or a note preview by default

#### Scenario: Friend disclosure matches owner disclosure
- **WHEN** a friend activates the `Details` toggle on a friend's book card
- **THEN** the friend card reveals the same disclosure content as the owner's `Show details` toggle (formats when present, every meaningful date with its localized label and value, the note when present, and any imported metadata)
- **AND** the disclosure content is keyboard reachable
