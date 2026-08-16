## 1. Middleware

- [x] 1.1 Add `/` to the public route matcher in `proxy.ts` so signed-out visitors can reach the landing page.

## 2. Landing page component

- [x] 2.1 Create `app/components/landing-page.tsx` with the app pitch, value proposition, and sign-up/sign-in CTAs.

## 3. Home route branching

- [x] 3.1 Update `app/page.tsx` to detect auth state and render the shelf for signed-in users or the landing page for signed-out visitors.

## 4. Validation

- [x] 4.1 Run TypeScript checks and lint.
- [x] 4.2 Verify signed-in users still see their shelf and signed-out visitors see the landing page.
