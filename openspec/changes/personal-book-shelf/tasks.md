## 1. App scaffold

- [x] 1.1 Create a Next.js App Router TypeScript app at the repo root with a local `npm run dev` script
- [x] 1.2 Add Clerk and wire `/sign-in` and `/sign-up` plus session middleware
- [x] 1.3 Add Drizzle, a local SQLite file at `data/app.db`, and a migrate script

## 2. Schema

- [x] 2.1 Add `users` (clerk_id unique, username unique nullable, lowercase)
- [x] 2.2 Add `books` (owner, title, status, formats JSON, optional dates, note)
- [x] 2.3 Add `friendships` (requester, addressee, pending|accepted, unique pair)
- [x] 2.4 Add `invite_links` (creator, token unique, used_at nullable)
- [x] 2.5 Generate and apply the first migration

## 3. Accounts

- [x] 3.1 On first signed-in request, insert a `users` row for the Clerk id if missing
- [x] 3.2 Build `/claim-username` and reject case-insensitive duplicates
- [x] 3.3 Redirect signed-in users without a username to `/claim-username` before shelf or invite pages
- [x] 3.4 Redirect signed-out users away from shelf, book, and friendship pages

## 4. Own shelf

- [x] 4.1 Create a book in any status with title required and all other fields optional
- [x] 4.2 Edit title, status (any to any), formats, dates, and note without auto-stamping dates
- [x] 4.3 Delete own book so it disappears from every own view
- [x] 4.4 Own all-books page at `/` with optional status filter
- [x] 4.5 Dedicated own pages at `/to-read`, `/reading`, `/read`, and `/abandoned`

## 5. Friendships

- [x] 5.1 `/friends`: send a username invite (pending); unknown username is an error
- [x] 5.2 Accept a pending request (both can see shelves) or decline it (row removed)
- [x] 5.3 Mint a one-shot new-member link and show its URL
- [x] 5.4 `/invite/:token`: signed-in visitor sees an error and the link stays unused
- [x] 5.5 `/invite/:token`: used or missing token is invalid and creates no friendship
- [x] 5.6 Unused link + new signup + username claim creates an accepted friendship and marks the link used
- [x] 5.7 Existing Clerk identity hitting a new-member link does not create a second user or consume the link
- [x] 5.8 Do not add an unfriend action

## 6. Friend shelves and privacy

- [x] 6.1 Shared access helper: owner or accepted friend may read; only owner may write or delete
- [x] 6.2 Friend all-books and per-status pages at `/u/:username` and `/u/:username/{status}`
- [x] 6.3 Non-friend visiting an existing username sees no books; unknown username is not found
- [x] 6.4 Pending requests never grant shelf access

## 7. Verify locally

- [x] 7.1 Confirm `npm run dev` starts the app against the local SQLite file
- [x] 7.2 Smoke-check signup, username claim, book CRUD, username invite, and new-member link
