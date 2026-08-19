## 1. Core i18n infrastructure

- [x] 1.1 Create `lib/i18n/locales.ts` with `Locale` type, supported locales array, and default locale logic
- [x] 1.2 Create English dictionary `lib/i18n/en.json` with all user-facing strings grouped by feature
- [x] 1.3 Create Spanish dictionary `lib/i18n/es.json` mirroring the English structure
- [x] 1.4 Create `lib/i18n/dictionaries.ts` with async `getDictionary(locale)` and typed dictionary shape
- [x] 1.5 Create `lib/i18n/server.ts` with `getLocale()` that reads the cookie and falls back to `Accept-Language`
- [x] 1.6 Create `app/actions/locale.ts` with `setLocale` server action that updates the locale cookie and revalidates paths

## 2. Client-side i18n support

- [x] 2.1 Create `app/components/locale-provider.tsx` client context exposing locale, dictionary, and `t()` helper
- [x] 2.2 Create `app/components/language-toggle.tsx` client component that calls `setLocale` and refreshes the router
- [x] 2.3 Update `app/layout.tsx` to read locale, load dictionary, and wrap children with `LocaleProvider`
- [x] 2.4 Add the language toggle to the signed-in header in `app/layout.tsx`

## 3. Translate status labels and shared UI

- [x] 3.1 Replace `STATUS_LABELS` usage with `getStatusLabel(t, status)` across `lib/types.ts` consumers
- [x] 3.2 Update `app/components/ui.tsx` badge and button text to accept/use dictionary where needed
- [x] 3.3 Update `app/components/shelf-nav.tsx` to receive and render translated labels and counts

## 4. Translate server pages

- [x] 4.1 Update `app/page.tsx` to load dictionary and pass translations to `ShelfNav` and `BookList`
- [x] 4.2 Update `app/to-read/page.tsx`, `app/reading/page.tsx`, `app/read/page.tsx`, `app/abandoned/page.tsx` with translated titles
- [x] 4.3 Update `app/friends/page.tsx` with translated section titles and pending labels
- [x] 4.4 Update `app/books/new/page.tsx` and `app/books/[id]/edit/page.tsx` with translated page titles
- [x] 4.5 Update `app/books/import/page.tsx` with translated import page labels
- [x] 4.6 Update `app/u/[username]/page.tsx` and `app/u/[username]/[status]/page.tsx` with translated friend shelf labels
- [x] 4.7 Update `app/claim-username/page.tsx` with translated prompt text
- [x] 4.8 Update `app/invite/invalid/page.tsx` and `app/invite/existing/page.tsx` with translated messages
- [x] 4.9 Update `app/components/landing-page.tsx` with translated landing content

## 5. Translate client components

- [x] 5.1 Update `app/components/book-form.tsx` and `app/components/create-book-form.tsx` to use `useTranslation` for labels
- [x] 5.2 Update `app/components/edit-book-form.tsx` to use `useTranslation` for labels, dates, and success message
- [x] 5.3 Update `app/components/book-list.tsx` to accept/use translated labels for dates, empty states, and actions
- [x] 5.4 Update `app/components/friends-list.tsx` to use translated labels
- [x] 5.5 Update `app/components/invite-username-form.tsx` and `app/components/mint-invite-link.tsx` to use translated labels
- [x] 5.6 Update `app/components/claim-username-form.tsx` to use translated labels and errors
- [x] 5.7 Update `app/components/goodreads-importer.tsx` to use translated progress and summary text
- [x] 5.8 Update `app/components/add-to-shelf-button.tsx` and `app/components/back-button.tsx` to use translated labels

## 6. Translate server actions

- [x] 6.1 Update `app/actions/books.ts` to return translation keys instead of raw English error strings
- [x] 6.2 Update `app/actions/friends.ts` to return translation keys instead of raw English error strings
- [x] 6.3 Update `app/actions/users.ts` to return translation keys instead of raw English error strings
- [x] 6.4 Update `app/actions/import.ts` to return translation keys instead of raw English error strings
- [x] 6.5 Update all client forms to translate returned error keys with `t()`

## 7. Verification

- [x] 7.1 Run `npm run lint` and `npx tsc --noEmit` with no errors
- [x] 7.2 Run `npm run db:smoke` successfully (after clearing test DB if needed)
- [x] 7.3 Manually verify English and Spanish render correctly on main pages
- [x] 7.4 Verify language toggle switches locale without changing URL
- [x] 7.5 Verify server-rendered first request shows correct language from cookie
