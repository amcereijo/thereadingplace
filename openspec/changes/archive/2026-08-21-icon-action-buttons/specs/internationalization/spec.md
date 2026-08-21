## MODIFIED Requirements

### Requirement: All user-facing text is translated
The system SHALL translate all user-facing text based on the active locale. This includes navigation labels, page titles, buttons, form labels, status labels, empty states, server action error messages, and landing page content. In addition, every icon-only action button SHALL have a localized `aria-label` key in the dictionary so screen readers announce the action in the active locale.

#### Scenario: Navigation in Spanish
- **WHEN** the active locale is `es`
- **THEN** the navigation shows "Estantería" and "Amigos" instead of "Shelf" and "Friends"

#### Scenario: Status labels in Spanish
- **WHEN** the active locale is `es`
- **THEN** status labels show "Por leer", "Leyendo", "Leído", and "Abandonado"

#### Scenario: Form labels in Spanish
- **WHEN** the active locale is `es`
- **THEN** form labels such as "Title", "Author", "Note", "Started", "Finished", and "Abandoned" are shown in Spanish

#### Scenario: Server action errors are translated
- **WHEN** a server action returns an error message and the active locale is `es`
- **THEN** the system displays the error message in Spanish

#### Scenario: Icon-only buttons have a localized aria-label
- **WHEN** an icon-only action button is rendered while the active locale is `es`
- **THEN** the button's `aria-label` is the Spanish value from the locale dictionary
- **AND** when the active locale is `en`, the `aria-label` is the English value
