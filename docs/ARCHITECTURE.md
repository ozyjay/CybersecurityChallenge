# Architecture

## Runtime design

The MVP is a static React and TypeScript application built with Vite. It has no
backend, service worker, database, remote assets, analytics, or runtime network
dependency. State exists only in React memory and a reset replaces it with the
initial state.

## Components and data

- `src/App.tsx` coordinates screens and visitor actions.
- `src/components/EmailScenario.tsx` renders the current email artefact.
- `src/scenarios/accountWarning.ts` contains typed scenario content.
- `src/scenarios/validate.ts` enforces content constraints during startup/tests.
- `src/state/game.ts` owns transitions and deterministic scoring.
- `src/types/scenario.ts` defines the extensible scenario contract.

The state machine follows `INTRO → SCENARIO → DECISION → REVEAL → RESULT`.
`RESET` is valid from every state and returns a clean `INTRO` state. Selecting a
clue toggles its identifier, preventing duplicate scoring.

## Configuration

Vite loads `APP_HOST` and `APP_PORT`; both development and preview servers use
strict-port behaviour. The development launcher performs an early conflict check.
`DEMO_MODE` is reserved for later booth behaviours and currently documents that
the application is in development mode.

## Extension points

Phase 2 can add content variants and scenario-specific renderers behind the same
typed scenario contract. Phase 3 can add timer and replay events to the reducer
without persistence. Content validation should become a data-level build step as
the library grows. A backend is not an assumed extension point.
