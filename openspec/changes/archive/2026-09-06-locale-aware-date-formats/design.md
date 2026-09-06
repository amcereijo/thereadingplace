## Context

The reading-app already has [lib/i18n/format-date.ts](lib/i18n/format-date.ts) for rendering stored ISO `YYYY-MM-DD` book dates per active locale. Two renderers compete on the same view today: the helper (server-rendered text in cards, lists, recommendation rows) and the browser-native `<input type="date">` picker (already locale-aware).

## Decisions

- Single-file change to `formatBookDate`: swap the Spanish output separator from `-` to `/`. No other touched file needs adjustment because every date-rendering surface in the app already routes through this helper.
- English keeps `YYYY-MM-DD` for backward compatibility with the existing `book-list`, `recommendation-row`, and statistics-card render paths.

## Risks / Trade-offs

- None meaningful; format string only. Storage remains ISO; the helper just visualises it.

## Open Questions

None.
