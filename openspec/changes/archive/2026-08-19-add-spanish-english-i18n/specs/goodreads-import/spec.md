## Purpose

Enables users to import their reading history and book data from Goodreads CSV export files into The Reading Place, preserving book metadata, ratings, and reading dates.

## MODIFIED Requirements

### Requirement: Import progress feedback
The system SHALL provide feedback during the import process. All feedback text SHALL be translated according to the active locale.

#### Scenario: Import progress display
- **WHEN** import is in progress
- **THEN** system shows progress indicator with count of processed books
- **AND** the indicator text is shown in the active locale

#### Scenario: Import completion summary
- **WHEN** import completes
- **THEN** system displays summary with total imported, skipped, and error counts
- **AND** the summary labels are shown in the active locale

### Requirement: CSV file upload and parsing
The system SHALL accept CSV files in Goodreads export format and parse them into structured book data. Labels and instructions on the import page SHALL be translated according to the active locale.

#### Scenario: Valid CSV file upload
- **WHEN** user uploads a CSV file with Goodreads export format
- **THEN** system parses the file and extracts book metadata (title, author, ISBN, rating, dates, review)
- **AND** page instructions are shown in the active locale

#### Scenario: Invalid file format
- **WHEN** user uploads a file that is not a valid CSV or not in Goodreads format
- **THEN** system displays an error message in the active locale indicating the file format is invalid
