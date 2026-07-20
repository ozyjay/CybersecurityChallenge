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
- `src/scenarios/index.ts` exposes five local scenario families and ten variants.
- `src/scenarios/randomise.ts` selects one variant per family and shuffles the
  deck through a deterministic seeded pseudo-random generator.
- Scenario data files contain content only; they do not define UI behaviour.
- `src/scenarios/validate.ts` enforces content constraints during startup/tests.
- `src/state/game.ts` owns transitions and deterministic scoring.
- `src/types/scenario.ts` defines the extensible scenario contract.

The state machine follows `INTRO → SCENARIO → DECISION → REVEAL → RESULT`.
`BEGIN` records the selected variant identifier. `RESET` is valid from every
state, increments the in-memory round seed, and returns a clean `INTRO` state
with no selected scenario. Selecting evidence toggles its identifier, preventing
duplicate scoring.

`ScenarioContent` is a discriminated union. The current content kinds are email,
direct message, QR poster, and sign-in page. Each renderer maps its prepared
content regions to clue identifiers through the shared selectable-region control.
The QR pattern and credential fields are inert visual elements, not links or
inputs.

Each `ScenarioFamily` contains a reviewed base case plus reviewed variants. At
session start and after reset, the app derives a deck from a random base seed and
round number. Supplying the optional `App` seed reproduces the exact order and
variant choices for tests and future replay. The seed and deck are not persisted.

Suspicious clues and benign decoys share selectable regions. Scoring rewards
correct clues, applies a small false-positive penalty to selected decoys, and
scores the final decision. Safe scenarios may contain no suspicious clues but
must contain reviewed benign regions.

## Configuration

Vite loads `APP_HOST` and `APP_PORT`; both development and preview servers use
strict-port behaviour. The development launcher performs an early conflict check.
`DEMO_MODE` is reserved for later booth behaviours and currently documents that
the application is in development mode.

## Extension points

New prepared content variants can be added to the discriminated union with a
matching renderer and region allowlist. Phase 3 can add timer and replay events
to the reducer without persistence. A backend is not an assumed extension point.
