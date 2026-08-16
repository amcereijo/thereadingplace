## 1. Database and data model

- [x] 1.1 Add an optional `author` text column to the `books` table in `lib/db/schema.ts`.
- [x] 1.2 Generate a Drizzle migration for the new `author` column and apply it.
- [x] 1.3 Add `author: string | null` to `BookRecord` in `lib/types.ts`.

## 2. Persistence layer

- [x] 2.1 Update `toBook` in `lib/books.ts` to map the new `author` DB column into `BookRecord.author`.
- [x] 2.2 Add `author` to the `createBook` input and insert it into the DB.
- [x] 2.3 Add `author` to the `updateBook` input and persist it.
- [x] 2.4 Copy `author` from the source book in `copyBook` when a friend adds it to their shelf.

## 3. Forms and server actions

- [x] 3.1 Add a `readAuthor` helper in `lib/forms.ts` that returns trimmed text or null for empty/whitespace values.
- [x] 3.2 Read `author` in `createBookAction` and pass it to `createBook` in `app/actions/books.ts`.
- [x] 3.3 Read `author` in `updateBookAction` and pass it to `updateBook` in `app/actions/books.ts`.
- [x] 3.4 Add an "Author" input to `app/components/book-form.tsx` wired to `name="author"`.

## 4. Display

- [x] 4.1 Update `BookList` in `app/components/book-list.tsx` to render the author next to the title when present (e.g., "Title by Author").
- [x] 4.2 Verify all list views (all-books, `/to-read`, `/reading`, `/read`, `/abandoned`, friend views) display the author consistently.

## 5. Goodreads import

- [x] 5.1 Update `importBooks` in `lib/goodreads-import.ts` to insert the parsed `author` into the new DB column instead of `metadataJson`.
- [x] 5.2 Remove `author` from the metadata object built during import.
- [x] 5.3 Import a sample Goodreads CSV and confirm the author appears in the book record and list view, not in metadata.

## 6. Validation and smoke testing

- [x] 6.1 Update `scripts/smoke.ts` (or equivalent smoke/seed scripts) to set and assert the `author` field.
- [x] 6.2 Run the smoke script and TypeScript checks; fix any compilation errors.
