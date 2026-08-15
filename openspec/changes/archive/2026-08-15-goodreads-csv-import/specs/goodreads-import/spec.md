## Purpose

Enables users to import their reading history and book data from Goodreads CSV export files into The Reading Place, preserving book metadata, ratings, and reading dates.

## ADDED Requirements

### Requirement: CSV file upload and parsing
The system SHALL accept CSV files in Goodreads export format and parse them into structured book data.

#### Scenario: Valid CSV file upload
- **WHEN** user uploads a CSV file with Goodreads export format
- **THEN** system parses the file and extracts book metadata (title, author, ISBN, rating, dates, review)

#### Scenario: Invalid file format
- **WHEN** user uploads a file that is not a valid CSV or not in Goodreads format
- **THEN** system displays an error message indicating the file format is invalid

### Requirement: Data field mapping
The system SHALL map Goodreads CSV columns to The Reading Place's book schema fields.

#### Scenario: Standard field mapping
- **WHEN** CSV contains standard Goodreads columns (Book Id, Title, Author, My Rating, Date Read, etc.)
- **THEN** system maps each column to the corresponding field in the book schema

#### Scenario: Missing optional fields
- **WHEN** CSV is missing optional columns (e.g., My Review, Private Notes)
- **THEN** system uses default values or null for those fields

### Requirement: Duplicate detection
The system SHALL detect and handle duplicate books during import.

#### Scenario: Duplicate book by ISBN
- **WHEN** imported book has an ISBN that already exists in the system
- **THEN** system skips the duplicate and reports it in import summary

#### Scenario: Duplicate book by title and author
- **WHEN** imported book has matching title and author but different ISBN
- **THEN** system flags it as potential duplicate for user review

### Requirement: Import progress feedback
The system SHALL provide feedback during the import process.

#### Scenario: Import progress display
- **WHEN** import is in progress
- **THEN** system shows progress indicator with count of processed books

#### Scenario: Import completion summary
- **WHEN** import completes
- **THEN** system displays summary with total imported, skipped, and error counts