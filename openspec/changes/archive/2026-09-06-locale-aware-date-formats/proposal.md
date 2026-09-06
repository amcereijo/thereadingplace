## Why

`formatBookDate` rendered Spanish-locale dates as `dd-mm-yyyy` (dashes) while the browser's `<input type="date">` shows them as `dd/mm/yyyy` (slashes) on the same form. Same data, two visual conventions, in the same view. Aligning them costs one line.

## What Changes

- Change [lib/i18n/format-date.ts](lib/i18n/format-date.ts) so Spanish-locale dates render as `dd/mm/yyyy` instead of `dd-mm-yyyy`. English keeps the `YYYY-MM-DD` shape it already used.
- Verified `tsc --noEmit`, `npm run lint`, `npm run build` clean.

## Impact

- One file, one format string. No DB changes. No behaviour contract change for the *user-visible* shape the browser already produces — only the helper that renders dates in cards / lists / recommendation rows is unified with the input picker's locale convention.
