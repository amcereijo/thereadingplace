## 1. Server-side lookup module

- [x] 1.1 Create `lib/google-books.ts` with a `searchVolumes(query, locale)` function that calls `https://www.googleapis.com/books/v1/volumes?q=…&langRestrict=…&maxResults=10&key=…` using `fetch` with `{ next: { revalidate: 3600 } }` cache. The `key` value is read from `process.env.GOOGLE_BOOKS_API_KEY`. If the env var is missing, throw so the route handler can catch and return an empty result.
- [x] 1.2 Add a normalizer that maps each `volumeInfo` into `{ id, title, authors[], publishedDate, publisher, pageCount, description, categories, averageRating, imageLinks, industryIdentifiers }` plus a `toStoredMetadata()` helper that flattens these into the `Record<string, unknown>` shape the books table expects (keys per `design.md`).

## 2. Search route handler

- [x] 2.1 Create `app/api/books/search/route.ts` exporting `GET(request: Request)` that reads `q` and `lang` from the URL, validates `q.length >= 2`, calls `searchVolumes`, and returns `{ results: NormalizedVolume[] }` as JSON.
- [x] 2.2 On any thrown error (network, non-2xx, parse) return `{ results: [] }` with status 200 so the client's silent-failure path works.
- [x] 2.3 Update `proxy.ts` matcher if the new `/api/books/search` route is blocked by the current matcher — the existing matcher already includes `"/(api|trpc)(.*)"`, so verify and skip if no change is needed.

## 3. i18n strings

- [x] 3.1 Add the new dictionary keys to `lib/i18n/en.json`: `bookSearch.placeholder`, `bookSearch.loading`, `bookSearch.noResults`, `bookSearch.unknownAuthor`. Also add a new top-level namespace `bookSearch` with these keys.
- [x] 3.2 Mirror the same keys in `lib/i18n/es.json` with Spanish translations.
- [x] 3.3 Extend the `Dictionary` type in `lib/i18n/dictionaries.ts` so the new keys are typed.

## 4. Typeahead UI component

- [x] 4.1 Create `app/components/book-search.tsx` as a `"use client"` component that renders an input wired to a debounced (300ms) effect, calls `fetch('/api/books/search?q=…&lang=…')` with an `AbortController`, and renders a results list under the input.
- [x] 4.2 Add keyboard navigation: ArrowDown/ArrowUp move highlight, Enter selects, Escape clears.
- [x] 4.3 Add loading and empty ("no results") states using the new i18n keys.
- [x] 4.4 Accept an `onSelect(volume: NormalizedVolume)` callback that fires with the normalized volume when the user picks a result. Do not manage title/author here — let the parent form own those.

## 5. Wire into CreateBookForm

- [x] 5.1 In `app/components/create-book-form.tsx`, lift the existing `useState` for `title` and `author` out of `BookForm` and into `CreateBookForm`, passing them down as props (or extract a small wrapper) so a child component can also set them when a result is picked.
- [x] 5.2 Render `<BookSearch onSelect={…} />` inside `CreateBookForm` above the `<BookForm>`, threading the locale down so it can pass `lang` to the route.
- [x] 5.3 On `onSelect(volume)`: set `title` to `volume.title`, set `author` to `volume.authors.join(", ")`, and stash the volume's `toStoredMetadata()` in a hidden input named `metadata` so the existing `readMetadata` helper in `lib/forms.ts:35` picks it up.
- [x] 5.4 Update `createBookAction` in `app/actions/books.ts:19` to forward `metadata: readMetadata(formData)` into `createBook` (the `updateBookAction` already does this; create was skipped because the create form had no metadata source).

## 6. Persistence plumbing

- [x] 6.1 Confirm `createBook` in `lib/books.ts:110` already accepts and persists `metadata` (it does — `metadataJson: JSON.stringify(input.metadata ?? {})`). No schema change required.

## 7. Manual verification

- [x] 7.0 Add a real `GOOGLE_BOOKS_API_KEY` to `.env.local` (the project already has a `.env.local` for Clerk). Without it, all lookups silently fail.
- [x] 7.1 Run `npm run lint` and `npm run build` to confirm the new files and types compile cleanly.
- [x] 7.2 Start `npm run dev` and on `/books/new`: type "the left hand of darkness" — verify a result list appears, picking one prefills title + author, and submitting saves the book with metadata populated in the DB.
- [x] 7.3 Verify the Spanish locale path: switch to ES, repeat — confirm `langRestrict=es` is sent and results bias toward Spanish editions.
- [x] 7.4 Verify graceful failure: temporarily point the route handler at a bad URL, confirm the typeahead silently hides and manual entry still submits.
- [x] 7.5 Verify no-results path: type "zzqqxxnosuchbook" — confirm the localized "no results" message shows.
