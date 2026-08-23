## 1. Page restructure

- [x] 1.1 In `app/friends/page.tsx`, remove the `<PendingInvitationsPreview>` import and usage.
- [x] 1.2 Confirm the page renders three sections in this order: Your friends (table), Pending invitations (`id="pending-invitations"`), Invite a friend (`id="invite-a-friend"`).

## 2. Component removal

- [x] 2.1 Delete `app/components/pending-invitations-preview.tsx`.

## 3. i18n

- [x] 3.1 Remove preview-only keys from `lib/i18n/en.json`: `pendingSummaryTitle`, `topNone`, `topMore`, `viewAll`, `viewAllCount`, `inviteFriendLink`.
- [x] 3.2 Remove the same keys from `lib/i18n/es.json`.

## 4. Verification

- [x] 4.1 Run `npm run lint` and `npx tsc --noEmit` and resolve any errors.
- [x] 4.2 Run `npm run build` and confirm no regressions.
- [x] 4.3 Confirm the side-nav badge is still wired (layout passes `incomingPendingRequests`; `SideNav` shows the badge on every page except `/friends`).
- [x] 4.4 Run `openspec validate remove-top-pending-preview --strict` and resolve any reported issues.
