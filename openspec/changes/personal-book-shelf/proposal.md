## Why

Goodreads is not an acceptable home for a personal reading list, and the current Notion setup (three lists with progressive required fields) is private, unstructured, and not shareable with people we actually know. We need a small, owned, web-accessible shelf: sign up, keep books, and let friends see each other's lists.

## What Changes

- New TypeScript web app for personal book shelves (books only).
- Anyone can create an account, pick a username, and add books.
- A book can be created in any status and moved to any other status: to-read, reading, read, abandoned.
- Title is the only required field. Formats (many), optional dates (`started_at`, `finished_at`, `abandoned_at`), and a single editable note are optional.
- Own-shelf views: all books with a status filter, plus a dedicated page per status. The same views exist for a friend's shelf.
- Shelves are friends-only. Friendship via username invite (request + accept) or a one-shot new-member link that friends both people on signup.
- Notion import is out of scope (manual migration). No shared book catalog / ISBN identity in v1.

## Capabilities

### New Capabilities

- `accounts`: sign up, session, unique username
- `book-shelf`: create/edit books, statuses, formats, dates, note, own-shelf views
- `friendships`: username invites, one-shot new-member links, friends-only shelf access

### Modified Capabilities

- None (greenfield)

## Impact

- Greenfield app: Next.js (TypeScript), SQLite locally / Turso or libSQL in production, Clerk for auth.
- New data: users, books, friendships, invite links.
- Cheap to run locally (`npm run dev` + one DB file) and on a small remote host (Fly.io or a VPS).
- No existing application code, APIs, or specs to migrate.
