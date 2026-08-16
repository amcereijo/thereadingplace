## Context

See `proposal.md` for motivation. The home route (`/`) currently uses `requireAppUser()`, which redirects signed-out visitors to `/sign-in`. There is no public-facing explanation of the app. The middleware in `proxy.ts` protects all non-public routes, including `/`.

## Goals / Non-Goals

**Goals:**
- Make `/` context-aware: show the existing shelf for signed-in users and a public landing page for signed-out visitors.
- Add a simple, on-brand landing page with the app's value proposition and sign-up/sign-in CTAs.
- Keep the signed-in shelf experience unchanged.

**Non-Goals:**
- Marketing-style animations, screenshots, or testimonials.
- SEO-optimized copy or structured data.
- Changing the sign-in or sign-up flows themselves.

## Decisions

### 1. Detect auth inside `app/page.tsx` instead of redirecting
**Rationale:** This keeps a single route for the home page and avoids an extra redirect for signed-out visitors. The page will use `auth()` from `@clerk/nextjs/server` to check session state and branch the UI.

**Alternatives considered:**
- Make `/` fully public in middleware and always check auth inside. This is essentially the same approach but more explicit.
- Create a separate `/welcome` route. Rejected because it fragments the home experience and requires extra redirect logic.

### 2. Add `/` to the middleware public routes
**Rationale:** The current `proxy.ts` matcher treats `/` as protected. We need to add `/` to `isPublicRoute` so signed-out visitors can reach the landing page without being redirected.

### 3. Extract landing UI into a dedicated component
**Rationale:** A new `LandingPage` component in `app/components/` keeps `app/page.tsx` focused on routing logic and makes the landing view reusable and testable.

### 4. Reuse existing UI components
**Rationale:** Use `PageTitle`, `PageSubtitle`, `LinkButton` from `app/components/ui` to stay consistent with the rest of the app.

## Risks / Trade-offs

- **Middleware still protects data routes** → Friend views, book pages, and API routes remain protected; only `/` becomes public.
- **Signed-out users can still try to access `/books/new`** → They will be redirected by middleware as before, which is correct.
- **No performance risk** → The landing page does not query the database.

## Migration Plan

1. Add `/` to the public route matcher in `proxy.ts`.
2. Create `app/components/landing-page.tsx` with the public view.
3. Update `app/page.tsx` to branch between shelf view and landing page based on auth state.
4. Verify signed-in users still see their shelf and signed-out visitors see the landing page.

## Open Questions

None. The scope and approach are clear.
