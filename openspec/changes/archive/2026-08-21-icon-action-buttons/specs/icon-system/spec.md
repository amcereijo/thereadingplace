## Purpose

Defines the icon system used for action buttons and links across the app: the library, the shared sizing and color conventions, the `<IconButton>` UI primitive, and the accessibility contract for icon-only controls so that every action remains usable and announceable.

## ADDED Requirements

### Requirement: Single icon library
The system SHALL render every action icon from a single icon library dependency (`lucide-react`). The system SHALL NOT add additional icon libraries. Existing inline SVG icons in the codebase SHALL be migrated to the same library for visual consistency.

#### Scenario: Every action icon comes from one library
- **WHEN** a developer adds a new action icon
- **THEN** the icon is imported from `lucide-react`

#### Scenario: No additional icon libraries are added
- **WHEN** the project's dependencies are inspected
- **THEN** only one icon-library package is present

### Requirement: Consistent icon sizing and color
The system SHALL render every action icon at a consistent size (`h-4 w-4` for icons inside `<Button>` and `<LinkButton>`, `h-5 w-5` for icons inside the new `<IconButton>` square primitive). The system SHALL color icons with `stroke="currentColor"` so the icon inherits the surrounding text color from the button variant.

#### Scenario: Icon color follows button variant
- **WHEN** an icon is rendered inside a primary `<Button>`
- **THEN** the icon stroke color equals the primary variant's text color

#### Scenario: Icon size matches surface
- **WHEN** an icon is rendered inside a square `<IconButton>`
- **THEN** the icon uses `h-5 w-5`

### Requirement: IconButton primitive
The system SHALL provide an `<IconButton>` UI primitive in `app/components/ui.tsx` that renders a square, accessible button (`h-9 w-9`, rounded, focusable) accepting the existing `primary | secondary | danger | ghost` variants, an `aria-label` (required), an `icon` slot, and standard button props. The primitive SHALL be used for every action that becomes icon-only.

#### Scenario: IconButton requires an aria-label
- **WHEN** a developer renders an `<IconButton>` without an `aria-label`
- **THEN** a TypeScript error is reported at compile time

#### Scenario: IconButton matches existing variants
- **WHEN** a developer renders an `<IconButton variant="danger">`
- **THEN** the button uses the same `bg-red-600 text-white` styling as the existing `Button` danger variant

### Requirement: Accessibility for icon-only controls
The system SHALL give every icon-only button a localized `aria-label` sourced from the active locale dictionary. The system SHALL set `aria-hidden="true"` on any icon that is purely decorative and rendered alongside a visible text label. The system SHALL keep the touch target at least 36×36 CSS pixels for icon-only buttons.

#### Scenario: Screen reader announces the action
- **WHEN** a screen reader focuses an icon-only `<IconButton>` for the action "Edit"
- **THEN** the screen reader announces the localized "Edit" string from the active locale dictionary

#### Scenario: Decorative icon is hidden from assistive technology
- **WHEN** an icon is rendered next to a visible text label
- **THEN** the icon has `aria-hidden="true"`
- **AND** the screen reader does not announce the icon

#### Scenario: Icon-only touch target meets minimum size
- **WHEN** an `<IconButton>` is rendered on a touch device
- **THEN** the button's rendered size is at least 36×36 CSS pixels
