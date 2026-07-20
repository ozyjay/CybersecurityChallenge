# Demo runbook

## Cold start

1. Open a terminal in the project directory.
2. Set `APP_HOST` and the approved development port if defaults are unsuitable.
3. Run `npm run validate:scenarios`, `npm test`, then `npm run dev`.
4. Open the printed local URL and use browser fullscreen mode if desired.

The default `4173` port is for development only. Do not present it as an event
allocation.

## Smoke test

1. Confirm all five case choices and the privacy statement are visible.
2. Use Tab and Enter to choose a case; select and deselect a clue.
3. Make a decision, inspect all evidence cards, and view the result.
4. Select **Choose the next case** and confirm the case list returns with no
   previous clue count, decision, score, or result.
5. Start a different scenario, use **Reset for next visitor**, and repeat once
   with touch or mouse input. Confirm the case order or wording may change while
   remaining within the prepared scenario set.

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

Replay mode is not available in Phase 1. Staff should use the normal interaction
path until the prepared automatic walkthrough is implemented.

## Shutdown

Close the demo tab, press Ctrl+C once in the server terminal, and confirm the
process exits. No visitor-data clean-up is needed because none is persisted.
