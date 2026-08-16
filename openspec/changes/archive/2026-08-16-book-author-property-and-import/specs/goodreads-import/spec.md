## MODIFIED Requirements

### Requirement: Data field mapping
The system SHALL map Goodreads CSV columns to The Reading Place's book schema fields, including storing extra metadata in a flexible JSON field. The "Author" CSV column SHALL be mapped to the book's `author` property, not to `metadata`.

#### Scenario: Standard field mapping
- **WHEN** CSV contains standard Goodreads columns (Book Id, Title, Author, My Rating, Date Read, etc.)
- **THEN** system maps each column to the corresponding field in the book schema
- **AND** the "Author" column is stored in the book's `author` property

#### Scenario: Missing optional fields
- **WHEN** CSV is missing optional columns (e.g., My Review, Private Notes, Author)
- **THEN** system uses default values or null for those fields
- **AND** the `author` property is null or absent when the "Author" column is missing

#### Scenario: Extra metadata storage
- **WHEN** CSV contains fields not mapped to standard book properties (e.g., Publisher, Binding, Number of Pages, Year Published)
- **THEN** system stores those fields in the `metadata` JSON property as key-value pairs
- **AND** the "Author" field is not included in `metadata`
