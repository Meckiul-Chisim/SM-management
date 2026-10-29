# Utilities

Plain functions with no React inside, so they are easy to test.

- `dates.js` – local date helpers (no time-zone shifts; never uses `toISOString()` for dates).
- `calendar.js` – month grid, week start, grouping posts by day.
- `filters.js` – search and filter posts and follow-ups.
- `followUps.js` – open / overdue logic and sorting.
- `contentDrafts.js` – template-based starter text (not AI).
- `theme.js`, `ambientPreference.js` – theme and background preferences.
- `ambientScene.js` – drawing code for the animated background.
