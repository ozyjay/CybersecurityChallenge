# Can You Spot the Scam?

A polished, local-first cybersecurity awareness game for a university Open Day
booth. Visitors inspect a fictional message, flag warning signs, choose a safe
response, and receive concise educational feedback.

## Status

Phase 1 (static vertical slice) is implemented with one curated fictional email
scenario. It includes the attract screen, clue selection, decision, evidence
reveal, result, and a one-action reset. Four-scenario selection, timer, replay,
staff controls, Playwright coverage, and burn-in testing are planned later.

The project is **not yet Open Day ready**. No formal event port has been allocated.

## Local setup

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`. The demo uses no backend, cloud services, external
fonts, or runtime assets and can run offline after dependencies are installed.

## Commands

```bash
npm run dev                 # preflight the configured port, then start Vite
npm test                    # run unit and component tests
npm run validate:scenarios  # check scenario source for unsafe content
npm run build               # type-check and create the static dist/ build
npm run preview             # preview the production build
```

## Configuration

Copy `.env.example` to `.env` or set environment variables in the shell:

```env
APP_HOST=127.0.0.1
APP_PORT=4173
DEMO_MODE=development
```

`4173` is a development default, not an Open Day allocation. The server uses
strict port handling and reports a clear error if the port is occupied. Ports
`3600`, `8600`, and `8610–8699` are rejected because they are owned by ModelDeck.
An event port must be recorded in the OpenDayOps registry and decisions log.

## Visitor and staff operation

Select **Tap to begin**, flag suspicious regions, make a decision, review the
evidence, and view the result. **Reset for next visitor** returns directly to the
attract screen and clears all in-memory state. Refresh the page if the browser
ever becomes unresponsive. Replay and dedicated staff controls are Phase 3 work.

## Privacy and safety

Everything shown is fictional. The application does not request or store names,
contact details, passwords, or other personal information. Displayed URLs are
inert text on reserved example domains. It has no analytics, tracking, network
submission, active QR destination, or real login form. See
[`docs/SAFETY_AND_PRIVACY.md`](docs/SAFETY_AND_PRIVACY.md).

## Current limitations

- Only the urgent account warning scenario is implemented.
- There is no timer, sound, replay mode, staff panel, or scenario picker yet.
- End-to-end, viewport, offline-request, and reduced-motion automation are Phase 4.
- A 60-minute booth burn-in and independent runbook rehearsal have not occurred.
