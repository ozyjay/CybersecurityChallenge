# Architecture

## Runtime design

The MVP is a static React and TypeScript application built with Vite. It has no
backend, service worker, database, remote assets, analytics, or runtime network
dependency. State exists only in React memory and a reset replaces it with the
initial state.

## Components and data

- `src/App.tsx` coordinates screens and visitor actions.
- `src/components/ScenarioDisplay.tsx` dispatches to format-specific renderers.
- `src/components/SelectableRegion.tsx` provides shared accessible clue controls.
- `src/scenarios/index.ts` exposes nine local scenario families and eighteen variants.
- `src/scenarios/randomise.ts` selects one variant per family and shuffles the
  deck through a deterministic seeded pseudo-random generator.
- `src/components/StaffControls.tsx` provides session-only booth settings and
  direct prepared-case controls.
- `src/hooks/useCountdown.ts` owns cancellable timer behaviour.
- `src/hooks/usePreparedReplay.ts` coordinates deterministic replay and
  capture-level visitor interruption.
- `src/config.ts` validates an optional URL seed for reproducible prepared runs.
- Scenario data files contain content only; they do not define UI behaviour.
- `src/scenarios/validate.ts` enforces content constraints during startup/tests.
- `src/state/game.ts` owns transitions and deterministic scoring.
- `src/types/scenario.ts` defines the extensible scenario contract.

Investigation cases follow `ATTRACT → INTRO → SCENARIO → DECISION → REVEAL → RESULT`.
Cipher cases follow `ATTRACT → INTRO → SCENARIO → REVEAL → RESULT` and retain
their method-specific selection, current word, hint count, and incorrect attempts
only in volatile game state. Solving a word advances through the authored message
without discarding a discovered shift, mapping, or keyword.

`BEGIN` records the selected variant identifier. From the result screen,
`NEXT_CASE` records that completed variant, increments the in-memory round seed,
and returns to `INTRO`. The next deck excludes only that exact variant, leaving
the family’s reviewed alternative available. `RETURN_TO_CASES` preserves an
existing exclusion when an unfinished case is left. `RESET` is valid from every
state and clears the exclusion for the next visitor. Selecting evidence toggles
its identifier, preventing duplicate scoring.

Timer configuration remains outside visitor game state so next-visitor reset can
clear interaction data without discarding booth settings. The timer runs only on
the interactive `SCENARIO` screen, is disabled during replay, doubles its duration
in relaxed mode, and cancels whenever the screen or case changes. Investigation
timers advance to a decision; an expired cipher timer remains at zero and allows
the visitor to continue.

Prepared replay uses normal reducer actions: start a seeded scenario, select up
to three reviewed clues, open the decision, choose the authored correct response,
show evidence and result, then return to attract mode. Looping advances through
the seeded deck. A capture-level pointer or keyboard listener cancels replay and
performs a clean next-visitor reset. Scheduled replay steps are disposed whenever
the stage changes or replay is interrupted.

`Scenario` and `ScenarioContent` are discriminated unions. The current content
kinds are email, direct message, QR poster, sign-in page, and cipher.
Investigation renderers map their prepared content regions to clue identifiers
through the shared selectable-region control.
The QR pattern and credential fields are inert visual elements, not links or
inputs. Cipher renderers apply reviewed Caesar, Atbash, Polybius, or Vigenère
decoding rules to local text. Visitors interact through large shift, alphabet,
coordinate-grid, or keyword buttons; there is no free-text input.

Each `ScenarioFamily` contains a reviewed base case plus reviewed variants. At
session start and after a case transition, the app derives a deck from a random
base seed and round number. Supplying the optional `App` seed reproduces the exact
order and variant choices for tests and future replay. The seed, deck, and most
recent completed-variant exclusion are not persisted.

Suspicious clues and benign decoys share selectable regions. Scoring rewards
correct clues, applies a small false-positive penalty to selected decoys, and
scores the final decision. Safe scenarios may contain no suspicious clues but
must contain reviewed benign regions.

## Configuration

Vite loads `APP_HOST` and `APP_PORT`; both development and preview servers use
strict-port behaviour. The development launcher performs an early conflict check
through the shared port policy, which also rejects ModelDeck-owned ports.
`DEMO_MODE` is reserved for later booth behaviours and currently documents that
the application is in development mode.

Node launchers resolve TypeScript, Vite, Vitest, and Playwright from the local
`node_modules` tree and execute them with `process.execPath`. Browser checks
preflight Playwright-managed Chromium and never fall back to a confined Snap
browser. Direct `node scripts/*.mjs` entry points remain available when a system
package-manager shim is unsuitable.

## Browser reliability checks

Playwright serves the compiled static build on isolated local port `4174` and
drives Chromium with one worker. The regular suite covers complete visitor and
staff journeys, keyboard use, a compact touch viewport, reduced motion, operation
after the browser context is placed offline, replay interruption, reset isolation,
and repeated use. A runtime guard fails a journey on uncaught page errors, browser
console errors, or requests outside the local preview origin.

The burn-in uses the same production server and runtime guard. It repeatedly
completes a seeded local case and periodically starts and interrupts prepared
replay for the configured duration. Test reports and failure artefacts remain
local and are ignored by Git.

## Extension points

New prepared content variants can be added to the discriminated union with a
matching renderer and region allowlist. Browser coverage can grow without
changing the static runtime design. A backend is not an assumed extension point.
