## Purpose

Lets a signed-in user on a mobile device scan a physical book's barcode with the device camera on the "Add a book" screen, look the code up in Google Books, confirm the match, and have the create-book form prefilled — without typing.

## ADDED Requirements

### Requirement: Mobile-only scan entry point
The system SHALL show a prominent "Scan barcode" button on the "Add a book" screen only on mobile viewport sizes, with visual weight comparable to the title search field.

#### Scenario: Mobile user sees the scan button
- **WHEN** a signed-in user opens the "Add a book" screen on a viewport below the desktop breakpoint
- **THEN** the system displays a clearly visible "Scan barcode" button near the title search field

#### Scenario: Desktop user does not see the scan button
- **WHEN** a signed-in user opens the "Add a book" screen on a desktop-width viewport
- **THEN** the system does not display the "Scan barcode" button
- **AND** the title search and manual form remain fully functional

#### Scenario: Browser without barcode support hides the button
- **WHEN** the user's browser does not provide a barcode detection capability
- **THEN** the system does not display the "Scan barcode" button at any viewport size

### Requirement: Camera overlay with live barcode decoding
The system SHALL open a full-screen camera overlay when the scan button is tapped, showing a live viewfinder with a visual scan-frame guide, continuously decoding supported barcode formats (including EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, and Codabar) without sending any image off the device.

#### Scenario: User scans a book barcode
- **WHEN** the user points the camera at a book barcode within the scan frame
- **THEN** the system decodes the barcode value client-side
- **AND** stops the decode loop and camera stream while processing the result

#### Scenario: User cancels scanning
- **WHEN** the user taps the cancel control in the camera overlay
- **THEN** the system closes the overlay, stops the camera stream, and returns to the unchanged "Add a book" form

#### Scenario: Image never leaves the device
- **WHEN** the camera overlay is active
- **THEN** the system performs all barcode decoding on the device
- **AND** never uploads camera frames or photos to any server

### Requirement: Camera permission denied shows manual ISBN fallback
The system SHALL display a manual ISBN entry panel inside the overlay when camera access is denied or unavailable, so the user can still complete the flow by typing the code.

#### Scenario: Permission denied
- **WHEN** the user denies the camera permission prompt (or has previously denied it)
- **THEN** the system shows an explanatory message and a manual ISBN entry field with a submit action inside the overlay

#### Scenario: Manual entry reaches the same lookup
- **WHEN** the user types an ISBN into the manual entry field and submits
- **THEN** the system looks up that code exactly as if it had been scanned

### Requirement: Lookup scanned code in Google Books
The system SHALL look up a decoded or manually entered code via Google Books ISBN search, biased toward the user's active locale, while keeping the Google Books API key server-side.

#### Scenario: Code matches a volume
- **WHEN** the scanned or entered code matches a Google Books volume
- **THEN** the system shows a confirmation card with the volume's cover (when available), title, and authors
- **AND** offers "Use this book" and "Scan again" actions

#### Scenario: Code matches nothing
- **WHEN** the scanned or entered code matches no Google Books volume
- **THEN** the system shows a "not found" message
- **AND** offers the user the option to scan again and to return to the form (where title search remains available)

#### Scenario: Lookup request fails
- **WHEN** the Google Books lookup fails due to a network or upstream error
- **THEN** the system shows an error message and offers to retry or scan again

### Requirement: Confirmation prefills the create-book form
The system SHALL, when the user confirms a matched volume with "Use this book", prefill the create-book form's title, author, and stored metadata identically to picking a result from the title search.

#### Scenario: User confirms the matched volume
- **WHEN** the user taps "Use this book" on the confirmation card
- **THEN** the system closes the overlay
- **AND** fills the form's title field with the volume's title
- **AND** fills the form's author field with the volume's authors joined by ", "
- **AND** stores the volume's metadata for submission with the book
- **AND** the user can still edit the title or author before submitting

#### Scenario: User chooses to scan again
- **WHEN** the user taps "Scan again" on the confirmation card
- **THEN** the system discards the current match and resumes live decoding without prefilling the form

### Requirement: All new UI text is localized
The system SHALL provide all new user-facing strings (button label, overlay copy, permission-denied message, manual-entry labels, confirmation and not-found states, error messages) in both supported locales, English and Spanish.

#### Scenario: Spanish user sees Spanish copy
- **WHEN** a user with the Spanish locale uses any part of the barcode scanning flow
- **THEN** all displayed text in the flow is in Spanish
