## Purpose

Defines the data model and validation rules for a book record, including optional author support used by manual entry and Goodreads import.

## ADDED Requirements

### Requirement: Book record includes an optional author property
The system SHALL allow a book record to store an optional `author` property.

#### Scenario: Create a book with an author
- **WHEN** a new book is created with a non-empty `author` value
- **THEN** the system stores that value in the book's `author` property

#### Scenario: Create a book without an author
- **WHEN** a new book is created with no `author` value provided
- **THEN** the system stores the book with `author` set to null or absent

### Requirement: Author is a simple text value
The system SHALL treat `author` as a single free-text string.

#### Scenario: Author contains common formatting
- **WHEN** an author value is provided
- **THEN** the system stores it exactly as submitted, without parsing or splitting

#### Scenario: Empty author is treated as absent
- **WHEN** an author value is empty or whitespace-only
- **THEN** the system treats the book as having no author
