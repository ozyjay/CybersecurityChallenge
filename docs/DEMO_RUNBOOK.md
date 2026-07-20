# Demo runbook

## Cold start

1. Open a terminal in the project directory.
2. Set `APP_HOST` and the approved development port if defaults are unsuitable.
3. Run `npm run validate:scenarios`, `npm test`, then `npm run dev`.
4. Open the printed local URL and use browser fullscreen mode if desired.

The default `4173` port is for development only. Do not present it as an event
allocation.

## Smoke test

1. Confirm the attract screen and privacy statement are visible.
2. Use Tab and Enter to start; select and deselect a clue.
3. Make a decision, inspect all evidence cards, and view the result.
4. Select **Reset for next visitor** and confirm the attract screen returns with
   no previous clue count, decision, score, or result.
5. Repeat once with touch or mouse input.

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
