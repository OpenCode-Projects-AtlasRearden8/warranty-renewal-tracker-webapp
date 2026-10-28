# STATUS.md — Warranty & Renewal Tracker

## What was built

An offline, zero-dependency web app for tracking warranties and renewals:

- **Warranty cards** — item name, category (appliance / car / phone /
  electronics / other), purchase date, warranty length in months or days,
  live countdown ("X days left", color-coded: covered / 90 days out /
  expiring soon / expired), and a document-storage location note per item.
  Optional "renewal cost on lapse" field feeds the forecast.
- **Renewal rows** — insurance, memberships, service plans and one-offs with
  cost, next due date, repeat interval, document note, due-date status
  badges, and one-click "Mark renewed" (advances the due date by the
  interval).
- **12-month forecast** — month-by-month bucket of every renewal due,
  including recurring renewals rolled forward from past-due dates, plus any
  warranted item renewal costs lapsing in that month; 12-month total.
- **CSV export** — both lists as dated `warranty-items-*.csv` and
  `renewals-*.csv` downloads.
- **localStorage persistence only.** Sortable warranty list (status /
  expiring-first / name). Built with plain HTML/CSS/JS, no frameworks, no
  network calls.

## How to run

- Open `index.html` in any modern browser (double-click works; `file://`
  is fully supported). Optional first-run sample data is offered and can be
  deleted afterward.
- Tests / build (Node.js 20 used for verification):
  - `node tests/run-tests.js` — 42 unit tests on the date/forecast math
  - `node tests/smoke-test.js` — simulated-DOM smoke test of save/render
  - `node build.js` — rebuilds `index.html` from `index.src.html` +
    `warranty-core.js`

## Verification results (final run)

- `tests/run-tests.js`: **42 passed, 0 failed**
- `tests/smoke-test.js`: **SMOKE OK** (item save → localStorage, card render
  with doc note, renewal save, forecast render, renewal-source separation)
- `build.js`: index.html rebuilt (28,696 bytes), inlined core verified
  byte-identical to `warranty-core.js`
- Inline script passes `node --check` syntax check
- Bugs found and fixed during verification: invalid dates rolling over
  (2026-13-01, Jan 32) now rejected; recurring renewals now appear in *every*
  forecast month they recur (a `break` stopped after the first); past-due
  recurring renewals now roll forward into the forecast window.

## Known gaps

- No import (CSV-in) yet — backup story is export-only for now.
- Renewals with no interval don't auto-complete; "Mark renewed" on them
  just warns instead of archiving.
- No email/notification reminders (works offline by design); the app is
  check-when-you-think-of-it.
- localStorage is per-browser/per-profile — clearing site data erases it,
  and data doesn't sync across devices (CSV export is the manual backup).
- Smoke test simulates DOM behavior with stubs; it does not run a real
  browser engine.
- Warranty "renewal cost" rows appear in the forecast only for the item's
  last recorded expiry, not a repeating cycle (one-shot estimate).

---
Built and maintained by Asdale Dynamics, LLC · MIT licensed (see LICENSE).
