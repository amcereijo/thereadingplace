## Why

The home route (`/`) currently redirects any visitor who is not signed in straight to the Clerk sign-in screen. This gives no context about the app and can feel abrupt for new visitors. A public landing page lets people understand the product before deciding to sign up or sign in.

## What Changes

- Make the home route (`/`) public and context-aware: signed-in users see their shelf, signed-out users see a landing page.
- Add a new public landing view with a short pitch, value proposition, and calls to action.
- Keep the existing shelf view unchanged for signed-in users.
- Update `proxy.ts` middleware so the home route is no longer protected.

## Capabilities

### New Capabilities
- `landing-page`: defines the public landing page shown to signed-out visitors on the home route.

### Modified Capabilities
- `book-shelf`: updates the home route requirement so it serves either the signed-in shelf view or the public landing page.

## Impact

- `app/page.tsx` will branch based on authentication state.
- New component for the landing page, likely under `app/components/`.
- `proxy.ts` matcher config will treat `/` as a public route.
- No database or API schema changes.
