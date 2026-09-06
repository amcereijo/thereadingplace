## Purpose

Lets a signed-in user see book dates in a visual format that matches the locale-default the browser already renders on the same form, so the value shown in a date input matches the value shown next to it in cards, lists, and recommendation rows.

## Requirements

### Requirement: Spanish-locale book dates use slashes not dashes
The system SHALL render stored ISO `YYYY-MM-DD` book dates as `dd/mm/yyyy` for Spanish-locale readers, matching the locale-default the browser's `<input type="date">` uses.

#### Scenario: Spanish locale shows slashed format
- **WHEN** a Spanish-locale reader views a book date in a card, list, or recommendation row
- **THEN** the system renders the date as `dd/mm/yyyy` with `/` as the separator

#### Scenario: English locale is unchanged
- **WHEN** an English-locale reader views the same date
- **THEN** the system continues to render it as `YYYY-MM-DD`

#### Scenario: Stored values remain ISO
- **WHEN** the helper renders a date
- **THEN** no stored value is modified; only the rendered output changes
