## 1. Server-side ISBN lookup route

- [x] 1.1 Add `GET /api/books/isbn?code=<value>&lang=<locale>` route handler under `app/api/books/`, wrapping the existing `searchByIsbn` from `lib/google-books.ts`, returning normalized `NormalizedVolume[]` JSON and mirroring `/api/books/search` error semantics (502 on upstream failure)
- [x] 1.2 Verify the route returns a match for a known ISBN (e.g. `9780756404741`) and an empty result for an unknown code

## 2. i18n strings

- [x] 2.1 Add a `barcodeScanner` dictionary section (button label, overlay title, cancel, permission-denied message, manual-entry label/placeholder/submit, not-found message, error message, "Use this book", "Scan again") to the English dictionary in `lib/i18n/`
- [x] 2.2 Add the corresponding Spanish translations to the Spanish dictionary

## 3. Barcode scanner components

- [x] 3.1 Create `BarcodeScannerButton` client component: renders only when `BarcodeDetector` is available (feature-detected on mount, filtering desired formats via `getSupportedFormats()`), styled as a full-width prominent button with `md:hidden`, opens the overlay on tap
- [x] 3.2 Create `BarcodeScannerOverlay` client component: full-screen fixed overlay with cancel control; acquires camera via `getUserMedia({ video: { facingMode: "environment" } })` and shows live video with a scan-frame guide
- [x] 3.3 Implement the decode loop: throttled (~4fps) `BarcodeDetector.detect(video)` over all supported book formats; stops stream and loop on first decode; debounces duplicate values; pauses when `document.hidden`; fully releases the stream on unmount/close
- [x] 3.4 Implement overlay states: looking-up (spinner), found (confirmation card with cover, title, authors, "Use this book" / "Scan again"), not-found (message + scan again + close), lookup-error (message + retry)
- [x] 3.5 Implement the permission-denied/unavailable state: explanatory message plus a manual ISBN input and submit button feeding the same lookup path

## 4. Form integration

- [x] 4.1 Wire `BarcodeScannerButton` into `CreateBookForm` directly below `BookSearch`, passing the existing `handleSelect` as `onSelect` so a confirmed volume prefills title, author, and metadata JSON through the same path as title search
- [x] 4.2 Verify a confirmed scan prefills the form, the user can still edit fields, and submitting stores Google Books metadata identically to a title-search pick

## 5. Validation on real devices

- [x] 5.1 Test on iPhone Safari (≥ 17.2): button visible, camera prompt, successful EAN-13 scan, confirmation card, form prefill
- [x] 5.2 Test on Android Chrome: same happy path plus a UPC-A / older-format book if available
- [x] 5.3 Test permission-denied path on one device: fallback panel with manual ISBN entry completes the flow
- [x] 5.4 Test on desktop viewport: scan button hidden, title search unaffected
- [x] 5.5 Test with browser lacking `BarcodeDetector` (e.g. Firefox): button hidden, no console errors
- [x] 5.6 Run `npm run lint` and `npm run build` with no new errors
