## Purpose

Lets a signed-in person quickly find an accepted friend by typing part of their username.

## ADDED Requirements

### Requirement: Filter friends by username
The system SHALL provide a search field on the accepted friends list that narrows the displayed friends to those whose usernames contain the typed text. The filter MUST match any contiguous substring and MUST NOT be case-sensitive. Clearing the field MUST restore the full list.

#### Scenario: Type a matching username
- **WHEN** a person types `mar` into the friends search field
- **THEN** the system displays only accepted friends whose usernames contain `mar` (case-insensitive)

#### Scenario: Type a non-matching username
- **WHEN** a person types `xyz` into the friends search field and no accepted friend has that substring
- **THEN** the system displays an empty result message

#### Scenario: Clear the search
- **WHEN** a person clears the search field
- **THEN** the system displays every accepted friend again
