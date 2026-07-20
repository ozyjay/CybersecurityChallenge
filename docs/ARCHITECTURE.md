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
- `src/scenarios/index.ts` exposes the four-scenario local catalogue.
- Scenario data files contain content only; they do not define UI behaviour.
- `src/scenarios/validate.ts` enforces content constraints during startup/tests.
- `src/state/game.ts` owns transitions and deterministic scoring.
- `src/types/scenario.ts` defines the extensible scenario contract.

The state machine follows `INTRO → SCENARIO → DECISION → REVEAL → RESULT`.
`BEGIN` records the selected scenario identifier. `RESET` is valid from every
state and returns a clean `INTRO` state with no selected scenario. Selecting a
clue toggles its identifier, preventing duplicate scoring.

`ScenarioContent` is a discriminated union. The current content kinds are email,
direct message, QR poster, and sign-in page. Each renderer maps its prepared
content regions to clue identifiers through the shared selectable-region control.
The QR pattern and credential fields are inert visual elements, not links or
inputs.

## Configuration

Vite loads `APP_HOST` and `APP_PORT`; both development and preview servers use
strict-port behaviour. The development launcher performs an early conflict check.
`DEMO_MODE` is reserved for later booth behaviours and currently documents that
the application is in development mode.

## Extension points

New prepared content variants can be added to the discriminated union with a
matching renderer and region allowlist. Phase 3 can add timer and replay events
to the reducer without persistence. A backend is not an assumed extension point.
