## ADDED Requirements

### Requirement: Book row shows a cover thumbnail
Each book row in the all-books view, each owner status view (`/to-read`, `/reading`, `/read`, `/abandoned`), and each friend shelf view SHALL display a cover thumbnail at the left of the row whenever the book has a `metadata.coverUrl`. When the cover is missing or fails to load, the row SHALL display the localized cover placeholder in the same slot.

#### Scenario: Owner row renders the cover
- **WHEN** the owner views any of their shelf views
- **THEN** each book card displays the book's cover thumbnail (or the placeholder) at the left of the row, before the title block

#### Scenario: Friend row renders the cover
- **WHEN** an accepted friend views the owner's shelf
- **THEN** each book card displays the book's cover thumbnail (or the placeholder) at the left of the row, before the title block
