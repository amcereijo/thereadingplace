## Context

The Add-a-book screen ([app/books/new/page.tsx](app/books/new/page.tsx)) renders `CreateBookForm`, which wires `BookSearch` → `handleSelect(volume)` → prefill of title/author/`metadataJson`. The server already exposes ISBN lookup via `searchByIsbn` in [lib/google-books.ts](lib/google-books.ts). Constraints: Next.js 16 App Router + React 19 client components, Vercel serverless (no large request bodies), Tailwind 4, en/es dictionaries in `lib/i18n/`, no new runtime dependencies desired.

## Goals / Non-Goals

**Goals:**
- Client-side barcode decode with the browser-native `BarcodeDetector` API — no image upload, no new dependencies, no server changes beyond (optionally) one thin route.
- Live viewfinder UX: continuous decode from a `getUserMedia` video stream.
- A confirmation step between "code decoded" and "form prefilled" so a misread or wrong-edition match never silently lands in the form.
- Graceful degradation at every layer: unsupported browser → button hidden; permission denied → manual ISBN entry; no match → clear "not found" state with paths to retry or fall back to title search.

**Non-Goals:**
- Desktop support (product decision; hidden via `md:` breakpoint).
- Cover-photo / vision-based identification (deferred; the camera plumbing here may be reused later).
- Live continuous scanning of multiple books in one session (one scan → confirm → done).
- ISBN-10 ↔ ISBN-13 conversion beyond what Google Books handles; raw decoded values are passed through.

## Decisions

### 1. Decode client-side with `BarcodeDetector`, no fallback library
`BarcodeDetector` (Chrome/Edge/Android, Safari iOS 17.2+) decodes all common book barcode symbologies natively. We pass `formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "codabar", "qr_code"]` (subject to `BarcodeDetector.getSupportedFormats()` filtering) so any edition/region/publisher barcode is accepted.

- **Alternative: zxing-js / html5-qrcode polyfill** — wider browser support, but adds ~1MB+ of WASM/JS, slower on low-end phones. Rejected for v1: unsupported browsers simply don't show the button (feature-detect `window.BarcodeDetector`), keeping bundle size at zero.

### 2. Live viewfinder over still-photo capture
`<input capture>` is simpler but forces the user to aim, shoot, then wait for a decode that may fail. A live stream with a scan-frame overlay decodes in milliseconds once the barcode is centered — the UX pattern users know from retail apps. Implementation: `getUserMedia({ video: { facingMode: "environment" } })` → `<video>` → `requestAnimationFrame` (or `setInterval` ~4fps) loop calling `detector.detect(video)`.

### 3. Thin server action / route for ISBN lookup
Reuse `searchByIsbn` server-side. Cleanest fit with the existing architecture is a small API route `GET /api/books/isbn?code=<value>&lang=<locale>` mirroring the existing `/api/books/search` route's shape (normalized `NormalizedVolume[]` response, 502 on upstream failure). The client component fetches it the same way `BookSearch` fetches `/api/books/search`, keeping all Google Books access server-side (API key stays out of the browser).

- **Alternative: reuse `/api/books/search` with `q=isbn:...`** — works but overloads semantics and leaks the `isbn:` syntax contract into the client. A dedicated route is ~15 lines and self-documenting.

### 4. Confirmation card before prefill
On decode, show a card with cover thumbnail, title, authors and two actions: "Use this book" (calls the same `handleSelect(volume)` as `BookSearch`, then closes the overlay) and "Scan again" (resumes the decode loop). This is a product decision (user confirmed) and costs one extra tap.

### 5. Component structure
- `BarcodeScannerButton` (client): renders only when `typeof window !== "undefined" && "BarcodeDetector" in window`, styled full-width with `md:hidden`, placed under `BookSearch` in `CreateBookForm`.
- `BarcodeScannerOverlay` (client): full-screen fixed overlay; owns the stream, decode loop, permission-denied state (renders manual ISBN input feeding the same lookup), lookup-loading / found / not-found states, and the confirmation card. Receives `onSelect: (volume: NormalizedVolume) => void` — identical contract to `BookSearch`.
- `CreateBookForm` gains one line: `<BarcodeScannerButton locale={locale} dictionary={dictionary} onSelect={handleSelect} />`. Zero changes to `BookForm` or the server action.

### 6. Mobile-only via CSS, not UA sniffing
`md:hidden` on the button. Mobile-only is a product choice, not a security boundary — the API route remains reachable like any other, consistent with existing routes.

### 7. i18n
New dictionary section (e.g. `barcodeScanner`) with keys for the button label, overlay title, cancel, permission-denied message, manual-entry placeholder/submit, not-found message, "Use this book", "Scan again". Added to both English and Spanish dictionaries, following existing `dictionary.bookSearch` patterns.

## Risks / Trade-offs

- **Camera permission denied or unavailable (desktop-like browsers, in-app webviews)** → detect `NotAllowedError`/`NotFoundError` from `getUserMedia` and render the manual-ISBN fallback panel inside the overlay instead of dead-ending.
- **Decoded value isn't in Google Books (rare/regional editions)** → "not found" state with "Scan again" and a hint to use title search; the scan never blocks the normal flow.
- **UPC-A / ISBN-10 codes may not match Google Books directly** → pass the raw code to `searchByIsbn` (it already strips spaces/hyphens); Google resolves most ISBN-10/EAN variants. Residual misses surface as the not-found state, which has an escape hatch.
- **`getUserMedia` requires a secure context** → production is HTTPS on Vercel; local dev on `localhost` is treated as secure by browsers. Non-issue, but worth noting for LAN testing on a phone (needs HTTPS tunnel or localhost port-forwarding).
- **Decode loop battery/CPU on phones** → throttle detection to ~4fps, stop the stream immediately on decode, cancel, or overlay close; pause when `document.hidden`.
- **Duplicate rapid decodes of the same code** → debounce: ignore identical values within the confirmation window.

## Migration Plan

Purely additive, no data model or env changes. Ship behind the existing `main` → Vercel pipeline. Rollback = revert the commit; no state to unwind. Verify on a physical iPhone (Safari ≥17.2) and Android (Chrome) before closing the change, including the permission-denied path.

## Open Questions

- Exact i18n copy for all new strings (can be refined during implementation without changing specs or task breakdown).
