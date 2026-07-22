# Demo runbook

## Cold start

1. Open a terminal in the project directory.
2. Set `APP_HOST` and the approved development port if defaults are unsuitable.
3. Run `npm run validate:scenarios`, `npm test`, then `npm run dev`.
4. Open the printed local URL and use browser fullscreen mode if desired.

The default `4173` port is for development only. Do not present it as an event
allocation.

## Pre-event verification

Install the Playwright Chromium browser once on the booth machine after
`npm install`:

```bash
npx playwright install chromium
```

Before rehearsal, run the scenario validator, unit/component suite, production
build and browser journeys:

```bash
npm run validate:scenarios
npm test
npm run build
npm run test:e2e
```

The browser suite uses isolated local port `4174` by default and fails if it is
occupied. This is an automated-test default, not an event allocation. Set a
different permitted test port with `E2E_PORT` when required.

Run the stability exercise on the intended booth machine and build:

```bash
npm run test:burn-in
```

It runs for 60 minutes by default, repeatedly completes a visitor case, exercises
replay interruption every ten cycles, and fails on page errors, console errors or
external requests. `BURN_IN_MINUTES` may shorten local proof runs, but a shortened
run does not satisfy the readiness gate. Record the date, version, machine,
duration, completed cycles and outcome in the event verification record.

## Smoke test

1. Confirm the attract screen, **Tap to begin**, and privacy statement are visible.
2. Use Tab and Enter to open the five-case selection; choose a case and select
   and deselect a clue.
3. Make a decision, inspect all evidence cards, and view the result.
4. Select **Choose the next case** and confirm the case list returns with no
   previous clue count, decision, score, or result. If the same scenario family
   is selected again, confirm its wording is the reviewed alternative variant.
5. Start a different scenario, use **Reset for next visitor**, and repeat once
   with touch or mouse input. Confirm the case order or wording may change while
   remaining within the prepared scenario set and no prior completion is retained.

## Staff controls

Open the panel using **Staff** or `Ctrl+Alt+S`; press Escape to close it.

- **Timer enabled**: standard 45-second investigation timer.
- **Relaxed 90-second timer**: doubles the timer without changing scoring.
- **Optional sound cues**: local cues only; disabled by default and never required.
- **Difficulty**: show all, starter-only, or intermediate-only visitor cases.
- **Prepared case**: choose the exact local variant for staff start or replay.
- **Loop automatically**: repeat replay across the seeded deck.
- **Return to attract screen** and **Reset for next visitor**: clean booth recovery.

## Prepared replay

1. Open staff controls and choose a prepared case.
2. Leave **Loop automatically** enabled for passive booth display, or disable it
   for a single walkthrough.
3. Select **Start prepared replay**.
4. Confirm the prepared-demonstration label remains visible while clues,
   decision, evidence, and result advance automatically.
5. Tap the screen or press any key. Confirm replay stops immediately at attract.

Replay is deterministic for a given seed, requires no network access, does not
run the visitor timer, and never uses generated content.

## Staff script

“Choose anything in the fictional message that feels suspicious. When you’re
ready, decide what you would do. There’s no personal information to enter and all
links are inactive.”

## Reset and troubleshooting

Use **Reset for next visitor** from the header or result. If display state is
uncertain, refresh the page; all state is memory-only. If startup reports an
occupied port, stop the process using that port or select another permitted
development port—do not let Vite choose one silently. If assets fail to load,
restart the local server and repeat the smoke test.

If replay does not advance, tap once to interrupt it, use **Reset for next
visitor**, and start it again from staff controls.

## Shutdown

Close the demo tab, press Ctrl+C once in the server terminal, and confirm the
process exits. No visitor-data clean-up is needed because none is persisted.
