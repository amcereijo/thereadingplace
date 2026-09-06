## Purpose

Lets a signed-in user see book dates in a visual format that matches the active in-app locale across every surface that displays a date — cards, lists, recommendation rows, and the `<input type="date">` fields on book forms.

## Requirements

### Requirement: Per-locale display format
The system SHALL render stored ISO `YYYY-MM-DD` book dates as `YYYY-MM-DD` in English and as `dd/mm/yyyy` in Spanish.

#### Scenario: Spanish locale shows slashed format
- **WHEN** a Spanish-locale reader views a book date in a card, list, or recommendation row
- **THEN** the system renders the date as `dd/mm/yyyy` with `/` as the separator

#### Scenario: English locale is unchanged
- **WHEN** an English-locale reader views the same date
- **THEN** the system continues to render it as `YYYY-MM-DD`

#### Scenario: Stored values remain ISO
- **WHEN** the helper renders a date
- **THEN** no stored value is modified; only the rendered output changes

### Requirement: Date inputs reflect the active locale
The system SHALL set the `lang` attribute on every book-form `<input type="date">` to the active in-app locale so the browser's date picker renders in that locale's convention.

#### Scenario: Spanish locale shows `dd/mm/yyyy` in the picker
- **WHEN** an owner with the Spanish locale opens a book form
- **THEN** each `<input type="date">` on the form is rendered with `lang="es"`
- **AND** the picker displays values in day/month/year order

#### Scenario: English locale shows `mm/dd/yyyy` (or browser default) in the picker
- **WHEN** an owner with the English locale opens a book form
- **THEN** each `<input type="date">` on the form is rendered with `lang="en"`
- **AND** the picker displays values in month/day/year order

### Requirement: Toggling the in-app locale updates date pickers on the current page
The system SHALL re-render the active page (including its date inputs) when the in-app language is toggled, so picker formats and rendered date text update without requiring a full navigation.

#### Scenario: Toggling language on `/stats` re-renders dates
- **WHEN** the owner toggles the language from English to Spanish while on the stats page
- **THEN** the system re-renders the page through `revalidatePath('/', 'layout')` and `router.refresh()`
- **AND** every visible date format swaps to `dd/mm/yyyy`
