## Context

The owner of a book can already befriend other accounts (the `friendships` capability) and any accepted friend can already copy a book from the owner's shelf to their own (the `friend-shelf-actions` capability). Both flows are pull: the friend is the actor. There is no sender-initiated action that says "I want you to read this," and the project has no concept of a notification, inbox, or cross-user message.

This change introduces a new `recommendations` data collection and four server actions plus a dedicated `/recommendations` page and a panel component. It also adds `Recommend` actions to the owner's own book-list and book edit views, and a conditional entry in `shelf-nav`.

See proposal.md for motivation and specs/recommendations/spec.md + specs/book-shelf/spec.md for requirements.

## Goals / Non-Goals

**Goals:**
- Add the `recommendations` table with snapshot fields and full status/timestamp tracking.
- Add four server actions (send, mark-seen, accept, dismiss) and one new lib function (`copyBookFromSnapshot`).
- Build a single `RecommendPanel` component used by both entry points (book list, edit view).
- Build a `/recommendations` page with received + sent sections.
- Render a `Recommendations` entry in `shelf-nav` only when the user has any recommendation row in either direction.
- Surface a translated, locale-aware UI across both languages.

**Non-Goals:**
- No rescind/withdraw action for the sender.
- No notification system, push notifications, or email.
- No deduplication of (sender, receiver, bookId) — duplicates are allowed.
- No new shelf-writing server action. Acceptance is implemented as a new action (`acceptRecommendationAction`) that calls a new `copyBookFromSnapshot` lib function; it does not reuse `copyBookFromFriendAction`.

## Decisions

### Snapshot fields on the recommendation row
**Decision:** Snapshot `title`, `author`, `formatsJson`, and `note` on the recommendation row at send-time. Keep `bookId` as an audit-only pointer with `ON DELETE SET NULL`.

**Rationale:** The user requirement is that the recommendation survives sender-side deletion of the source book. A live join to `books` would break that. Snapshotting means the row is self-contained for display and acceptance. The `bookId` field is retained for "remember what book this was" audit value but never queried for live data.

**Alternative considered:** Keep all data live with a "source book not found" guard on accept and display. Rejected because it complicates the UI (every render needs to handle the missing case) and makes acceptance conditional on the source still existing, which contradicts the user's "the recommendation lives" rule.

### Separate `copyBookFromSnapshot` lib function
**Decision:** Add `copyBookFromSnapshot` to `lib/books.ts` (or a new `lib/recommendations.ts`) that takes the snapshotted fields directly instead of reading from a live book row. The `acceptRecommendationAction` calls this function with values from the recommendation row.

**Rationale:** The existing `copyBook` reads the source book by id and copies from it. For recommendations the source may not exist. A separate lib function that takes fields directly is the cleanest abstraction and reuses the same `computeDatesForStatus` and insert logic.

**Alternative considered:** Extend `copyBook` to accept either a `bookId` or a snapshot parameter. Rejected — overloads an existing function for a different access pattern.

### New `acceptRecommendationAction`, not a wrapper around `copyBookFromFriendAction`
**Decision:** Add `acceptRecommendationAction` as a separate server action that performs both the shelf insert and the recommendation status update.

**Rationale:** The two operations must be transactional (the book and the recommendation row must agree). `copyBookFromFriendAction` only knows how to copy from a friend's shelf and revalidate; tacking on recommendation status updates would muddle its single responsibility. A dedicated action gives a clean boundary and a natural place to put the `seenAt`/status validation.

### Single `RecommendPanel` component used by two entry points
**Decision:** Build `app/components/recommend-panel.tsx` once. The book list renders a `Recommend` button per card; the book edit view renders one `Recommend` button. Both invoke the same panel.

**Rationale:** The panel's content (friend picker + message input + submit) is identical regardless of where it's launched from. Reusing one component matches the `add-to-shelf-button` precedent.

**Alternative considered:** Two separate panel components tuned to each entry point. Rejected — duplication of behavior and styling.

### Mark-seen on render, server-side
**Decision:** Drop the `seenAt`-based mark-seen flow entirely. The "unread" indicator for the received section SHALL equal the count of rows where the viewer is the receiver and `status = pending`. The row stays in `status = pending` (and therefore unread) until the receiver accepts or dismisses it. The `/recommendations` page SHALL NOT mutate any rows as part of its render path. The `seenAt` column on the table MAY be retained for audit but is no longer read by application logic.

**Rationale:** Marking on render creates an unread indicator that disappears the moment the user opens the page, which doesn't match how users actually treat a recommendation inbox. They expect pending rows to remain actionable (and the badge to remain visible) until they decide. Removing mark-seen also removes a non-obvious server-side mutation on a GET-shaped page render, which is cleaner architecturally.

**Alternative considered:** Keep mark-seen and have the unread badge use `status = 'pending' AND seenAt IS NULL`. Rejected because it conflates two ideas (unread vs pending) and creates the surprising behavior of "I haven't done anything yet but my badge disappeared."

### `shelf-nav` shows Recommendations conditionally
**Decision:** Add a `hasRecommendations: boolean` prop to `ShelfNav`. The page-level component (the home shelf page and the `/recommendations` page when it shares the nav) computes it from a count query. The component renders the `Recommendations` link only when the flag is true.

**Rationale:** The `ShelfNav` component is shared between owner views and friend views. Friend views shouldn't show a `Recommendations` link that points to the owner's recommendations inbox. Passing the flag explicitly keeps the friend-vs-owner boundary clean.

**Alternative considered:** Have `ShelfNav` itself call a count query. Rejected — server components shouldn't query from inside a reusable nav component that doesn't own the viewer identity, and the home page already calls counts (`countBooksByStatus`); adding another count there is consistent.

### Friend picker uses an inline filter, not a search modal
**Decision:** The panel's friend picker is a filterable list of accepted friends, similar to the existing `friend-search` filter on the friends management page. It filters client-side as the user types.

**Rationale:** Friendships are bounded; an inline filter is simpler than a search modal and matches the existing `friend-search` interaction. The codebase already has a precedent for typing-to-filter a small list.

**Alternative considered:** Modal-with-search over the global user space. Rejected — out of scope (recommendations are friends-only by spec) and heavier than needed.

### Reply field on accept/dismiss
**Decision:** Add a single nullable `reply` column on the `recommendations` table, plus a `replyAt` timestamp. The same field is used for both accept and dismiss responses. The accept modal and the dismiss action both gain an optional textarea. The sender's sent view shows the reply beneath the original message when present. The reply SHALL NOT be editable after submission.

**Rationale:** A single field keeps the schema and UI simple and matches the spec's stance that accept and dismiss are equivalent terminal states of a recommendation. A reply is an optional annotation, not a different conversation; giving it its own table would over-model the feature.

**Alternative considered:** Separate `acceptedReply` and `dismissedReply` columns. Rejected — adds schema complexity for a distinction the UI doesn't surface. A future iteration could split them if the two actions diverge in semantics.

### Accepted and dismissed rows stay visible on both sides
**Decision:** No row deletion. `/recommendations` shows pending rows prominently and renders accepted/dismissed rows beneath them, dimmed.

**Rationale:** The user explicitly chose no rescind, and accepted/dismissed rows are the only audit memory of what was sent and how it landed. Auto-deleting on accept/dismiss would lose that history with no path to recover it. The spec already mandates this; the design just confirms the rendering decision.

## Risks / Trade-offs

- **Snapshot drift** → If the sender edits the source book after recommending, the receiver sees the older snapshot. This is intentional per the spec ("snapshots are immutable from send-time") and is documented as a property, not a bug. Mitigation: the spec states this explicitly.
- **Unbounded row accumulation** → Recommendations never delete. Over years a user could accumulate hundreds of rows. Mitigation: out of scope for v1; a future "clear sent/received" affordance can be added without changing the schema.
- **Drizzle FK + SET NULL semantics** → Drizzle's `references()` with `onDelete: "set null"` must be configured in the schema. The deployment migration (Drizzle Kit) must apply this rule; if the rule is missed the FK becomes `NO ACTION` and the schema can't be created if any existing `books` row is missing a referent. Mitigation: verify the generated SQL migration contains `ON DELETE SET NULL` before deploying.
- **Mark-seen side effects on render** → Running a write as part of a server-component render means a GET request mutates state. This is unusual but not unprecedented in Next.js server components. Mitigation: the operation is idempotent (re-stamping `seenAt` to "now" on a row that's already seen is a no-op in effect, though it does update the timestamp — to avoid spurious timestamp churn, the bulk update filters `seenAt IS NULL`).
- **Friend picker shows stale data after a new friend is added** → The panel renders with the friends list as of the page load; if the user adds a friend in another tab and then opens the panel, the new friend won't appear. Mitigation: not material for v1; panel is short-lived and the next page load refreshes.

## Migration Plan

- Generate a Drizzle migration with `drizzle-kit generate` after adding the table; confirm the SQL contains the `ON DELETE SET NULL` clause on `book_id`.
- Apply the migration locally; confirm `npm run dev` boots cleanly and the new table exists.
- Add i18n keys to `lib/i18n/en.json` and `lib/i18n/es.json` for the new UI strings (panel title, status labels, button text, panel placeholders).
- Deploy: the change adds a new table; no destructive change to existing tables, so the deploy is additive and rollback-safe (drop the new table).

**Note on the smoke script:** `scripts/smoke-recommendations.ts` is a destructive test (it deletes all rows from `books`, `recommendations`, and `users`). It refuses to run unless `DATABASE_PATH` (or a Turso URL env var) is set, so it cannot wipe the local dev DB by accident. The migration itself is additive-only and never deletes from any table.
