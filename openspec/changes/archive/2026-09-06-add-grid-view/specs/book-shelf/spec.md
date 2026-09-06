## ADDED Requirements

### Requirement: Shelf view mode toggle

The shelf SHALL offer a view-mode toggle that lets the viewer switch between a list view and a grid view. The toggle SHALL appear in the existing shelf toolbar, next to the sort selector, as two icon-only buttons with localized aria-labels.

#### Scenario: First-time viewer sees list
- **WHEN** the viewer has not previously selected a view mode on this device
- **THEN** the shelf renders in list view

#### Scenario: Returning viewer sees remembered mode
- **WHEN** the viewer previously selected grid view on this device
- **AND** the viewer reopens the shelf in a later session
- **THEN** the shelf renders in grid view without the viewer having to toggle

#### Scenario: Viewer switches to grid
- **WHEN** the viewer activates the grid toggle
- **THEN** the shelf re-renders in grid view
- **AND** the choice is remembered on this device

#### Scenario: Viewer switches back to list
- **WHEN** the viewer is in grid view and activates the list toggle
- **THEN** the shelf re-renders in list view
- **AND** the choice is remembered on this device

### Requirement: Grid view renders each book as a cover card

In grid view, the shelf SHALL render each book as a card whose layout adapts column count to the viewport width. Each card SHALL display the cover image (or the existing placeholder when no cover is available), the title, the author, the status badge, and the most relevant date for that status. The cover image SHALL be displayed at portrait aspect ratio.

#### Scenario: Grid card content
- **WHEN** the shelf renders in grid view
- **THEN** each card displays the book's cover, title, author, status badge, and a date chosen from `finished → started → abandoned → added` based on the book's status

#### Scenario: No cover available
- **WHEN** a book has no cover URL
- **THEN** the grid card displays the same placeholder used in list view

#### Scenario: Column count adapts to viewport
- **WHEN** the viewport width changes
- **THEN** the number of grid columns adjusts so cards remain readable without horizontal scrolling

### Requirement: Grid view opens a modal for book details

In grid view, selecting a book SHALL open a modal that shows the same book details currently shown when expanding a row in list view, plus the actions available to the viewer. The modal SHALL close when the viewer clicks outside it or presses the `Esc` key.

#### Scenario: Owner opens their own book
- **WHEN** the viewer is the owner and selects a book in grid view
- **THEN** a modal opens showing the book's full details and the actions: change status, edit, recommend, delete

#### Scenario: Friend opens someone else's book
- **WHEN** the viewer is not the owner and selects a book in grid view
- **THEN** a modal opens showing the book's full details and the actions: add to my shelf
- **AND** destructive and ownership-scoped actions are NOT shown

#### Scenario: Close on backdrop click
- **WHEN** the modal is open and the viewer clicks outside the modal panel
- **THEN** the modal closes

#### Scenario: Close on Esc
- **WHEN** the modal is open and the viewer presses the `Esc` key
- **THEN** the modal closes