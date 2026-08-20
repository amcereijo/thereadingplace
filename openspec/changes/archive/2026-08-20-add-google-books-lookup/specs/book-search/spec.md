## Purpose

Lets a signed-in user search Google Books by title while creating a book, pick a match from the results, and have the form prefilled with the match's title, author, and stored metadata so the user does not have to retype them.

## ADDED Requirements

### Requirement: Search Google Books by title
The system SHALL provide a search field in the "Add a book" form that, as the user types a title, fetches matching volumes from Google Books and shows the top results to the user.

#### Scenario: Type a query and see results
- **WHEN** the user has typed at least 2 characters in the book-search field
- **THEN** the system displays a list of up to 10 matching volumes from Google Books
- **AND** each result shows the title, the author (or "Unknown author" when none), and the year of publication when available

#### Scenario: Empty or short query hides results
- **WHEN** the user has typed fewer than 2 characters in the book-search field, or has cleared it
- **THEN** the system does not fetch and does not display any results

#### Scenario: Select a result prefills the form
- **WHEN** the user picks a result from the list
- **THEN** the system fills the form's title field with that volume's title
- **AND** the system fills the form's author field with that volume's authors joined by ", " (in the order Google Books returns them)
- **AND** the system hides the result list
- **AND** the user can still edit the title or author before submitting

#### Scenario: Pick with keyboard
- **WHEN** the user has typed a query and the result list is visible
- **THEN** the system lets the user move a highlight through the results with the arrow keys
- **AND** lets the user pick the highlighted result with Enter

### Requirement: Store match metadata with the book
The system SHALL store extra fields from a Google Books match alongside the new book so they can be read or displayed later.

#### Scenario: Pick a result and submit the form
- **WHEN** the user picks a result, leaves the prefilled title and author, and submits the form
- **THEN** the system saves the book with that title and author
- **AND** stores these match fields, when present, on the book: cover URL, ISBN-10, ISBN-13, publisher, page count, published date, description, categories, average rating, and the Google Books volume id

#### Scenario: Type a manual title and submit
- **WHEN** the user types a title without picking a result and submits the form
- **THEN** the system saves the book with no Google Books metadata attached

#### Scenario: Pick a result then edit the title
- **WHEN** the user picks a result and then changes the prefilled title before submitting
- **THEN** the system saves the book with the edited title
- **AND** still stores the match metadata from the original result

### Requirement: Multiple authors become one author string
The system SHALL store the authors from a Google Books match as a single free-text string joined by ", ", matching the existing book author format.

#### Scenario: Result with one author
- **WHEN** the user picks a result whose Google Books entry has one author
- **THEN** the system fills the form's author field with that single author

#### Scenario: Result with multiple authors
- **WHEN** the user picks a result whose Google Books entry has multiple authors
- **THEN** the system fills the form's author field with those authors joined by ", " in Google Books' order

### Requirement: Locale-aware result bias
The system SHALL bias Google Books results toward the user's active locale when one of the supported locales (English or Spanish) is active.

#### Scenario: User is on the Spanish locale
- **WHEN** the user has the Spanish locale active and types a query that could match titles in either language
- **THEN** the system biases results toward Spanish-language editions

#### Scenario: User is on the English locale
- **WHEN** the user has the English locale active
- **THEN** the system biases results toward English-language editions

### Requirement: Graceful failure
The system SHALL keep the form usable when Google Books cannot be reached or returns no useful response.

#### Scenario: Network error
- **WHEN** the user types a query and the lookup fails because of a network or upstream error
- **THEN** the system does not show an error to the user inside the form
- **AND** the user can still type and submit a title manually

#### Scenario: No matches
- **WHEN** the user types a query and Google Books returns zero matches
- **THEN** the system shows a localized "no results" message
- **AND** the user can still type and submit a title manually

### Requirement: Server-side lookup
The system SHALL perform Google Books lookups on the server, never in the user's browser.

#### Scenario: Request flows through the server
- **WHEN** the user types a query
- **THEN** the user's browser calls the server's lookup endpoint
- **AND** the server calls Google Books and returns the normalized matches to the browser
- **AND** the user's browser never receives a direct connection to Google Books
