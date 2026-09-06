## Why

Adding a book on mobile currently requires typing a title into the search box, which is slow and error-prone on a phone keyboard. Most physical books carry an ISBN barcode, so letting mobile users point their camera at the barcode is the fastest possible path to an exact, unambiguous book match — and the codebase already has ISBN lookup (`searchByIsbn`) and the select-and-prefill flow built.

## What Changes

- Add a prominent, mobile-only "Scan barcode" button on the "Add a book" screen ([app/books/new](app/books/new/page.tsx)), placed directly under the existing title search with equal visual weight. Hidden on desktop (`md:` and up) and hidden when the browser lacks `BarcodeDetector` support.
- Add a full-screen camera overlay (live viewfinder with a scan-frame guide, cancel button) that continuously decodes barcodes client-side using the browser-native `BarcodeDetector` API. No image ever leaves the device.
- Support all barcode formats the platform `BarcodeDetector` can decode (EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF, Codabar, QR, etc.), since book barcodes vary by edition, region, and publisher. Any decoded value that looks like an ISBN/EAN is used for lookup.
- On successful decode, look the code up via Google Books ISBN search and show a confirmation card (cover, title, author) with "Use this book" / "Scan again" options before committing.
- On confirm, prefill the create-book form exactly as the existing title-search selection does (title, author, stored metadata JSON), reusing the same code path.
- If camera permission is denied, show a fallback panel with a manual ISBN entry field that feeds the same lookup flow.
- If no volume matches the scanned code, show a clear "not found" state that lets the user scan again or fall back to title search.
- Add i18n strings for all new UI text (English and Spanish dictionaries).

## Capabilities

### New Capabilities
- `barcode-scanner`: Mobile-only barcode scanning on the Add-a-book screen — camera overlay, client-side ISBN/EAN decode via `BarcodeDetector`, Google Books lookup by scanned code, confirmation step, form prefill, and manual-ISBN fallback when camera access is unavailable or denied.

### Modified Capabilities
<!-- book-search behavior (type-ahead by title) is unchanged; the scanner reuses its
     select handler but that is an implementation detail, not a requirement change. -->

## Impact

- **Code**: new `BarcodeScanner` client component and camera overlay UI; new entry point in `create-book-form.tsx`; possibly a thin `/api/books/isbn` route wrapping the existing `searchByIsbn`; i18n dictionary additions in `lib/i18n/`.
- **APIs**: no breaking changes. Existing `/api/books/search` and `searchByIsbn` behavior untouched.
- **Dependencies**: none added. Uses the browser-native `BarcodeDetector` API (Chrome/Android, Safari iOS 17.2+; unsupported browsers simply don't render the button).
- **Infra/cost**: none. No image upload, no new env vars, no external services, no Vercel body-limit concerns.
- **Constraints**: mobile-only by product decision (CSS `md:hidden`), not a security boundary; camera permission requested in-browser; feature degrades to hidden button on unsupported browsers.
