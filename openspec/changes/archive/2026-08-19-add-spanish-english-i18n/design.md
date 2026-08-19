## Context

The app is a Next.js 15 application using the App Router. Most pages are server components; a few forms and interactive elements are client components. All user-facing text is currently hard-coded English. Clerk handles authentication. Tailwind CSS is used for styling. See `proposal.md` for the motivation to add Spanish/English i18n.

## Goals / Non-Goals

**Goals:**
- Provide English and Spanish translations for every user-facing string.
- Resolve the active locale from a cookie, falling back to the browser's `Accept-Language` header.
- Keep all existing server components server-rendered.
- Add a single `EN | ES` toggle in the signed-in header.
- Keep URLs unchanged across locales.
- Persist the user's choice in a cookie so it survives reloads and works for SSR.

**Non-Goals:**
- Locale-prefixed routes (e.g. `/es/amigos`).
- Per-user language preference stored in the database.
- Translating user-generated content such as book titles, notes, or metadata.
- Right-to-left (RTL) layout support.
- Pluralization beyond the simple "book(s)" currently used.

## Decisions

### Decision: Custom i18n instead of `next-intl`
**Rationale:** The app is small and the requirements are simple (two locales, no route prefixes, cookie-based). A custom dictionary + helper avoids adding a dependency and the routing middleware that `next-intl` typically requires. The cost is a little more boilerplate passing dictionaries to server components.

**Alternative considered:** `next-intl` — more robust for routing and complex pluralization, but overkill here and would require middleware changes.

### Decision: Cookie-based locale with `Accept-Language` fallback
**Rationale:** Cookies are readable by both server and client on the first request, avoiding a flash of English. A manual toggle updates the cookie via a server action and refreshes the route. This is simpler than a database preference and works for signed-out visitors too.

**Alternative considered:** `localStorage` only — simple on the client but unreadable by the server, causing SSR/CSR mismatch and a language flash.

### Decision: Pass dictionaries through server component props
**Rationale:** Server components cannot use React Context. The cleanest way to keep them server-rendered is to load the dictionary at the page level and pass a `t` helper or the raw dictionary object down to child server components.

**Alternative considered:** Make text-heavy components client components to use a single `useTranslation` hook — rejected because the goal is to keep server components server-rendered.

### Decision: Flat dictionary JSON files grouped by feature
**Rationale:** Flat keys such as `nav.shelf` are easy to look up and keep related text together. Grouping by feature area (nav, status, actions, errors, landing, etc.) makes it easier to spot missing translations.

**Alternative considered:** Hierarchical nested objects with a recursive lookup — adds complexity without benefit.

### Decision: Keep status enum values internal, translate only labels
**Rationale:** The database stores `to-read`, `reading`, `read`, `abandoned`. The internal values stay the same; only displayed labels change with locale. This avoids a data migration.

### Decision: Server actions return translation keys, not translated strings
**Rationale:** Server actions do not have easy access to the locale dictionary without threading it through every call. Returning stable error keys (e.g. `errors.titleRequired`) lets client components translate them with the current locale.

**Alternative considered:** Translate errors inside server actions — would require every action to accept or load the dictionary, complicating signatures.

## Risks / Trade-offs

- **Boilerplate:** Every server page must load and pass the dictionary. Mitigation: keep the helper small and provide a `t` function so call sites stay readable.
- **Missing translations:** Adding new UI text requires updating both `en.json` and `es.json`. Mitigation: type the dictionary with TypeScript to get autocomplete and catch missing keys at build time.
- **Toggle visibility:** The toggle is client-side; it briefly does not render during server render. Mitigation: place it in the header and render a neutral placeholder or nothing until hydrated.
- **Status label consistency:** Status labels appear in the `ui.tsx` badge component, `lib/types.ts`, forms, and friend shelf selectors. They must all draw from the same dictionary. Mitigation: replace `STATUS_LABELS` with a `getStatusLabel(t, status)` helper used everywhere.

## Migration Plan

No database migration or external dependency changes are required. Deployment steps:
1. Merge the branch.
2. Deploy as normal; the cookie-based locale takes effect immediately for new requests.
3. Existing users see English by default until they switch or their browser reports Spanish.

Rollback: revert the commit; no persistent data changes.

## Open Questions

None at this time.
