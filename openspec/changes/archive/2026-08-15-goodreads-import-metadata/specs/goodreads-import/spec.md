## MODIFIED Requirements

### Requirement: Data field mapping
The system SHALL map Goodreads CSV columns to The Reading Place's book schema fields, including storing extra metadata in a flexible JSON field.

#### Scenario: Standard field mapping
- **WHEN** CSV contains standard Goodreads columns (Book Id, Title, Author, My Rating, Date Read, etc.)
- **THEN** system maps each column to the corresponding field in the book schema

#### Scenario: Missing optional fields
- **WHEN** CSV is missing optional columns (e.g., My Review, Private Notes)
- **THEN** system uses default values or null for those fields

#### Scenario: Extra metadata storage
- **WHEN** CSV contains fields not mapped to standard book properties (e.g., Publisher, Binding, Number of Pages, Year Published)
- **THEN** system stores those fields in the `metadata` JSON property as key-value pairs

## ADDED Requirements

### Requirement: Date added preservation
The system SHALL preserve the original "Date Added" date from Goodreads imports.

#### Scenario: Date added stored
- **WHEN** a book is imported with a "Date Added" value
- **THEN** system stores the date in the `dateAdded` field of the book record

#### Scenario: Missing date added
- **WHEN** a book is imported without a "Date Added" value
- **THEN** system sets `dateAdded` to null

### Requirement: Finished date from Date Read
The system SHALL correctly populate the finishedAt field from the "Date Read" CSV column.

#### Scenario: Finished date stored
- **WHEN** a book is imported with a "Date Read" value
- **THEN** system stores the date in the `finishedAt` field of the book record

#### Scenario: No finished date
- **WHEN** a book is imported without a "Date Read" value
- **THEN** system sets `finishedAt` to null