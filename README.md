# Warranty & Renewal Tracker

A friendly, offline web app for the warranties and renewals that love to sneak
past you — appliance coverage, car/phone warranties, insurance renewals,
memberships, and service plans — with a 12-month big-expense forecast and
one-click CSV export.

Built to be *actually* beginner-friendly, like everything from
[Asdale Dynamics, LLC](https://dylanasdale.github.io): plain English, step by
step, never condescending.

## Highlights

- **Item cards** for anything with a warranty (appliance, car, phone, ...) —
  purchase date, warranty length (months *or* days), and a live expiry
  countdown with color-coded status (covered / 90 days out / expiring soon /
  expired).
- **Document-storage notes** — jot down *where the paper lives* ("kitchen
  drawer, envelope A") right on the card.
- **Renewal rows** for insurance, memberships, subscriptions, and service
  plans, with repeat intervals and one-click "mark renewed".
- **Big-expense forecast** — everything due in the next 12 months, laid out
  month by month with a running total (recurring renewals roll forward
  automatically, even past-due ones).
- **CSV export** — both lists as downloadable, spreadsheet-ready files.
- **Zero dependencies.** No build step, no install, no account, no internet.
- **Local-first** — everything lives in your browser's `localStorage`.
  Nothing ever leaves your device.

## How to run it

1. Download (or clone) this folder.
2. Double-click **`index.html`** — it just opens in any modern browser,
   straight from your file system (`file://` is fully supported).
3. Optionally accept the sample data on first run, poke around, then delete
   the samples by hand. That's the whole tutorial.

To run the tests (optional; needs [Node.js](https://nodejs.org)):

```sh
node tests/run-tests.js     # 42 assertions on the expiry/date/forecast math
node tests/smoke-test.js    # simulated browser: saving + rendering paths
node build.js               # rebuild index.html from index.src.html
```

## Privacy

There is no privacy section to read because there is nothing to read:
no accounts, no servers, no analytics, no network calls of any kind. Your
data is stored locally in your browser and can be wiped with a browser reset,
so export CSVs if it matters to you.

## Repo layout

| File | What it is |
|---|---|
| `index.html` | The app — the single self-contained file you open in a browser |
| `index.src.html` | The app source *with* a placeholder where `build.js` inlines `warranty-core.js` |
| `warranty-core.js` | The pure date/forecast math, shared by the app and the tests |
| `build.js` | Tiny build script that inlines the core into a self-contained `index.html` |
| `tests/run-tests.js` | Unit tests for expiry math and forecast logic |
| `tests/smoke-test.js` | Simulated-browser smoke test of save/render paths |

Editing tip: change app UI in `index.src.html` (or logic in
`warranty-core.js`), then run `node build.js` to regenerate `index.html`.
This keeps the test suite and the shipped app in sync from a single source of
truth.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Asdale Dynamics, LLC.

This tool pairs well with the [free-home-inventory-kit](https://github.com/dylanasdale) —
inventory your belongings there, then track their coverage here.
