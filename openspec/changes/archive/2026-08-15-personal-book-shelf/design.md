## Context

Greenfield repo: OpenSpec scaffolding only, no application code. Constraints from the proposal: TypeScript, simple database, easy local run, cheap remote, reuse known services for auth. Behavior is in `specs/accounts`, `specs/book-shelf`, and `specs/friendships`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- One TypeScript app that runs locally with `npm run dev` and a single SQLite file.
- Same SQL dialect in production via libSQL/Turso.
- Auth delegated to Clerk; this app owns username, books, friendships, and invite links.
- Server-enforced friends-only access on every shelf read.

**Non-Goals:**

- Shared book catalog, ISBN, or cover lookup.
- Notion import.
- Unfriend, block, or friendship expiry.
- Production deploy automation (host choice can wait).
- Generic trackers (movies, etc.).

## Decisions

### 1. Next.js App Router + TypeScript

One process for UI and mutations. Server Components and server actions keep shelf queries on the server so friends-only checks cannot be bypassed in the client.

Alternatives: Vite + Hono (two packages, more glue), Remix (also fine; Next is the more familiar default here).

### 2. Clerk for identity, app table for username

Clerk handles signup, session, and sign-out. After first sign-in, a `users` row is created keyed by `clerk_id` with `username` null until claimed. Middleware / layout redirects signed-in users without a username to a claim page before any shelf or invite UI.

Alternatives: Better Auth (more code we own), Supabase Auth (pulls in Postgres we do not need).

### 3. Drizzle + SQLite locally, libSQL/Turso in production

File DB locally (`data/app.db`). Same Drizzle schema against Turso when hosted. Dates stored as ISO date strings (`YYYY-MM-DD`) or null. Formats stored as a JSON array of the allowed enum values.

```
users
  id, clerk_id UNIQUE, username UNIQUE NULL, created_at
  username stored lowercase; uniqueness is on that column

books
  id, owner_id → users, title, status, formats_json,
  started_at, finished_at, abandoned_at, note, created_at, updated_at

friendships
  id, requester_id → users, addressee_id → users,
  status (pending | accepted), created_at
  UNIQUE(requester_id, addressee_id)
  no row means not friends; declined deletes the pending row

invite_links
  id, creator_id → users, token UNIQUE, used_at NULL, created_at
```

Friendship pairs are canonicalized when querying (match either direction). Accepting a request updates `status` to `accepted`. There is no unfriend path.

Alternatives: Prisma (heavier), raw SQL (fine at this size, worse migrations), Supabase/Postgres (more moving parts locally).

### 4. Routes

```
/sign-in, /sign-up          Clerk
/claim-username             required until username is set
/                           own all-books (optional ?status=)
/to-read /reading /read /abandoned
/u/:username                friend all-books (optional ?status=)
/u/:username/to-read|reading|read|abandoned
/friends                    pending inbox + send username invite + mint link
/invite/:token              new-member link landing
```

Own-shelf pages reuse one list component. Status pages lock the filter. Friend pages use the same component with a read-only flag after an accepted-friendship check.

### 5. New-member link flow

1. Owner mints a random token; row stored with `used_at` null. No expiry.
2. `/invite/:token` — if signed in, show error, do not set `used_at`.
3. If token missing or `used_at` set, show invalid.
4. If unused and signed out, send the person through Clerk signup with the token kept in a short-lived cookie or query.
5. After Clerk session exists: if `users` already has this `clerk_id`, reject and leave the link unused.
6. Else insert `users`, send them to claim username, then insert `friendships` (accepted) with the creator and set `used_at`.

Friendship is created only after username claim so both sides always have a handle.

### 6. Access checks

Every book list/read/write loads the viewer from the Clerk session, requires a username, then:

- write / delete: `book.owner_id === viewer.id`
- read: owner or an accepted friendship in either direction

Non-friends requesting `/u/:username` get a "username exists, shelf is private" page when the user exists, and not-found when it does not. Signed-out requests never see books.

### 7. Dates and notes

Status changes update only `status`. Date fields are written only when the form sends them. Note is a nullable text column on `books`, replaced on save.

## Risks / Trade-offs

- [Clerk free-tier / lock-in] → Acceptable for v1; username and books live in our DB so identity could be swapped later.
- [One-shot link never expires] → Lost links stay valid until used; owner can mint another. Add expiry later if needed.
- [No unfriend] → A mistaken accept is permanent in v1; documented in specs.
- [Username enumeration] → Inviting or visiting `/u/:name` reveals whether a handle exists. Required for username invites; books stay hidden.
- [SQLite on a multi-instance host] → Local is one process; production should be Turso, not a local file on Fly with more than one machine.

## Migration Plan

- First deploy: empty DB, run Drizzle migrations.
- No existing user data to migrate (Notion is manual).
- Rollback: take the app down or revert the deploy; data is new and disposable until people rely on it.

## Open Questions

None that affect specs, approach, or task breakdown. Host (Fly vs VPS) and Clerk instance details can be chosen at apply time.
