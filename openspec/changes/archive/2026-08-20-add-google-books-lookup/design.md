## Context

The "Add a book" page lives at `app/books/new/page.tsx` and currently renders a `<CreateBookForm>` (client) that wraps `<BookForm>` (client), which posts a server action (`createBookAction` in `app/actions/books.ts:19`) that calls `createBook` in `lib/books.ts:110`. The book record already has a `metadata: Record<string, unknown>` JSON column (`lib/db/schema.ts:25`), and the Goodreads import already stores extras there (`openspec/specs/goodreads-import/spec.md:32-35`), so the storage half of this change is essentially free.

The project has no external HTTP integrations today — the first `fetch()` to a third party will be added here.

## Goals / Non-Goals

**Goals:**

- A typeahead inside the "Add a book" form that suggests Google Books matches as the user types a title.
- Selecting a match prefills title + author and stashes extras in `metadata`.
- A server-side route handler that proxies Google Books so we can cache and keep keys off the client.
- Manual entry still works without changes.

**Non-Goals:**

- Editing existing books via Google Books re-lookup (out of scope; would be a follow-up).
- Using Google Books for the edit form (`/books/[id]`). Same as above.
- Using Google Books for the Goodreads import path. CSV import stays its own thing.
- Deduplication or "match this book to one already on my shelf" — the stored `googleBooksId` enables this later but the feature is not in this change.
- Surfacing the cover thumbnail or description in the shelf UI. The data is stored; rendering it is a follow-up.

## Decisions

### Decision: Server-side Route Handler over Server Action

We use `app/api/books/search/route.ts` as a GET handler that the client calls via `fetch` + `AbortController`, not a server action.

- **Why**: A typeahead is naturally a "search this string, return matches" pattern — exactly what Route Handlers exist for. Server actions are awkward for ad-hoc query shapes and don't compose as cleanly with `AbortController` / debouncing.
- **Alternative considered**: Server action invoked imperatively from the client (`useTransition`). Cleaner architecturally but adds friction for aborting in-flight calls and doesn't naturally separate the "fetch JSON" step from the form submit step.
- **Why it fits**: It's the first HTTP endpoint in the project but `proxy.ts` already shows the team is comfortable with Next 16's renamed conventions. Route Handlers are the documented Next 16 idiom (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`).

### Decision: Cache at the route level with `revalidate`

The route handler uses Next's per-request caching: `next: { revalidate: 3600 }` on the outbound `fetch` to Google Books.

- **Why**: One hour is the right freshness for book metadata — titles, authors, covers don't change minute to minute, but we don't want to hammer Google Books on every keystroke across users. Next 16 caches per-request URL, so identical queries collapse.
- **Alternative considered**: A `Map<string, ...>` in module scope in `lib/google-books.ts`. Simpler, no Next magic, but per-instance only — won't share across serverless invocations or survive cold starts. We can layer this on later if needed.
- **Alternative considered**: `unstable_cache`. More flexible keying but overkill for "the same query string returns the same thing" — `fetch`'s built-in caching is the simpler primitive.

### Decision: Join multiple authors with ", "

When Google Books returns `authors: ["Ursula K. Le Guin", "The Artist"]`, we store `author = "Ursula K. Le Guin, The Artist"`.

- **Why**: The current `BookRecord.author` is a single free-text string (`openspec/specs/books/spec.md:18-25`). Widening it to an array would change the schema and the Goodreads spec. Joining preserves both.
- **Trade-off**: Round-tripping back to Google Books from a stored book would need to re-split. We don't do that today, so this is a non-issue.

### Decision: Locale bias via `langRestrict`

When the active locale is `en` or `es`, pass `langRestrict=en` or `langRestrict=es` to the Google Books query.

- **Why**: Google Books supports it, the project already has EN/ES, and Spanish-language editions matter for Spanish-speaking users.
- **Why not auto-detect from title**: Query-time lang detection adds latency and ambiguity; the user's chosen locale is a stronger signal.

### Decision: Failures are silent in the UI

When the fetch to Google Books fails (network, 5xx, rate limit), the typeahead just doesn't appear. No toast, no error message.

- **Why**: Manual entry is the fallback. An error inside a typeahead is more disruptive than a missing typeahead. A "no results" empty state still shows when the request succeeded but returned zero matches.
- **Trade-off**: A transient outage is invisible to the user. They might wonder why suggestions stopped working. For v1 we accept this — adding a banner is a future change if it becomes a real problem.

### Decision: API key required, read server-side from env

Google Books requires an API key on every request, even for public-data searches (per Google's "Authorizing requests and identifying your application" docs). We read it from `process.env.GOOGLE_BOOKS_API_KEY` inside the route handler and pass it as `?key=…` on the outbound fetch.

- **Why**: The key is required by the upstream API — without it Google returns `400`. Reading from `process.env` keeps it out of the client bundle and out of any logs.
- **Trade-off**: A new env var to set in dev and deploy. `.env.local` needs `GOOGLE_BOOKS_API_KEY=…` for local development; production needs the same var in the deploy environment.
- **Failure mode**: If the env var is missing, the route handler returns `{ results: [] }` (silent failure, like network errors) and the typeahead hides. We do not crash the request and we do not surface the missing-key condition to the user — manual entry still works.

### Decision: Debounce 300ms, min 2 chars

The client debounces the input by 300ms and only fires a request when the query has 2+ characters.

- **Why**: 2 chars is below Google's useful threshold but above the noise floor. 300ms is the conventional debounce — short enough to feel live, long enough to skip keystrokes.
- **Alternative considered**: 500ms. Slightly fewer requests, but feels sluggish.

### Decision: Metadata stored as flat string-keyed JSON

The `metadata` field stores these keys when present:

```
googleBooksId, coverUrl, isbn10, isbn13,
publisher, pageCount, publishedDate,
description, categories, averageRating
```

- **Why**: Flat shape matches Goodreads' pattern (`openspec/specs/goodreads-import/spec.md:32-35`) and keeps the field a simple `Record<string, unknown>`. No nesting needed.
- **Trade-off**: A future "cover URLs come in multiple sizes" or "categories is a list" needs more thought. For v1 a single string per key is enough — categories is stored as a JSON-encoded string array.

## Risks / Trade-offs

- **Google Books rate limit / downtime / missing API key** → silent failure in all three cases, user falls back to manual entry.
- **Wrong-language results** → `langRestrict` bias plus user can edit title/author before submitting.
- **Stale metadata** → 1h cache. Book data doesn't change often, and if a user notices stale metadata they can edit or re-import later.
- **Description length / size** → Google Books descriptions can be 1000+ chars. Stored as-is in `metadata.description`. No size cap in SQLite TEXT, but UI rendering of long descriptions is out of scope for this change.
- **First external HTTP call in the codebase** → adds a new failure surface (network egress). Mitigated by server-side caching and silent failure.
- **ISBN disambiguation** → Google Books may return multiple editions for one ISBN13/title. We surface up to 10 and let the user pick; we don't auto-pick the "best" one.

## Open Questions

- None that affect this change. Two follow-ups worth noting for later: (1) rendering the stored `coverUrl` and `description` on the shelf and detail views, (2) using `googleBooksId` to surface duplicates when adding a second copy.
