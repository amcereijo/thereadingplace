## Why

The Reading Place currently only supports English. Adding Spanish and English language support makes the app accessible to a broader audience and prepares the codebase for future languages.

## What Changes

- Introduce a lightweight i18n system with dictionary files for English and Spanish.
- Resolve the active locale from a cookie, falling back to the browser's `Accept-Language` header on first visit.
- Add a single language toggle (`EN | ES`) in the header for manual switching.
- Translate all user-facing strings: navigation, page titles, buttons, labels, status labels, form fields, empty states, and server action error messages.
- Keep URLs unchanged and server components server-rendered by passing the locale/dictionary through props.
- Add a thin client context for interactive components (forms, toggle) that need client-side access to translations.

## Capabilities

### New Capabilities
- `internationalization`: Locale resolution, dictionary loading, language toggle, and translation helpers.

### Modified Capabilities
- `book-shelf`: Status labels and UI text become locale-aware.
- `friendships`: Friends page labels and actions become locale-aware.
- `goodreads-import`: Import page labels and progress text become locale-aware.
- `accounts`: Sign-in/up call-to-actions and username claim text become locale-aware.

## Impact

- New files: `lib/i18n/*`, new client provider and toggle components, server action for setting locale.
- Modified files: all `app/page.tsx`, `app/components/*.tsx`, server actions, `lib/types.ts` status labels.
- Dependency: `next/headers` for server-side cookie reading.
