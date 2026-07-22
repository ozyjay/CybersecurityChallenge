# Verification record

This file records technical rehearsal evidence. It does not replace independent
staff operation, OpenDayOps acceptance, or the event readiness decision.

## MVP 0.5 — 20 July 2026

- Scenario validation: passed, five scenario files
- Unit and component tests: passed, 70 tests
- Production build: passed
- Chromium production-browser journeys: passed, nine tests and one expected
  burn-in skip
- Short burn-in proof: passed, 0.1 minute and 24 visitor cycles
- Required 60-minute burn-in: passed, 11,129 visitor cycles with no page errors,
  console errors or unexpected network requests
- Independent operator runbook rehearsal: pending
- OpenDayOps event port and presentation rotation: pending

Environment notes: Playwright installed its supported Chromium fallback build for
the local Linux environment. Automated browser serving used isolated development
port `4174`; this is not an event port allocation.

## Caesar cipher addition — 22 July 2026

- Scenario validation: passed, six scenario files and twelve materialised variants
- Unit and component tests: passed, 84 tests
- Production build: passed
- Chromium production-browser journeys: passed, ten tests and one expected
  burn-in skip, including the local cipher journey and runtime-network guard
- Required 60-minute burn-in: not repeated for this change
- Independent operator runbook rehearsal: pending
- OpenDayOps event port and presentation rotation: pending
