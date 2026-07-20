# Can You Spot the Scam?

A polished, local-first cybersecurity awareness game for a university Open Day
booth. Visitors inspect a fictional message, flag warning signs, choose a safe
response, and receive concise educational feedback.

## Status

MVP 0.4 includes five curated fictional scenario families with ten reviewed
variants: an urgent account email, campus Wi-Fi poster, internship direct
message, shared-document sign-in page, and a genuinely safe notification. Each
round selects one local variant per family and shuffles the case order. Every case
supports clue selection, false-positive explanations, a safety decision, evidence
reveal, educational scoring, and a clean one-action reset. Booth operation now
includes an attract screen, optional standard or relaxed timer, sound-off default,
difficulty filtering, direct staff scenario selection, and prepared offline
replay. Playwright coverage and burn-in testing remain planned for Phase 4.

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

Select **Tap to begin**, choose one of five cases, flag suspicious regions, make a decision, review the
evidence, and view the result. **Reset for next visitor** or **Choose the next
case** returns directly to the case list and clears the current score and choices.
After a completed case, its exact variant is withheld from the next deck; the
same scenario family remains available through its reviewed alternative. **Reset
for next visitor** clears this temporary exclusion completely. Refresh the page if
the browser ever becomes unresponsive. No generated or downloaded scenario text
is used.

Open the staff panel with the unobtrusive **Staff** button or `Ctrl+Alt+S`.
Staff can configure timing, optional sound, difficulty, exact scenario selection,
attract mode, next-visitor reset, and prepared replay. Replay is clearly labelled,
uses only the seeded local deck, and stops on any key press or screen tap.

## Privacy and safety

Everything shown is fictional. The application does not request or store names,
contact details, passwords, or other personal information. Displayed URLs are
inert text on reserved example domains. It has no analytics, tracking, network
submission, active QR destination, or real login form. See
[`docs/SAFETY_AND_PRIVACY.md`](docs/SAFETY_AND_PRIVACY.md).

Randomness is limited to selecting and ordering reviewed local variants. The
randomiser accepts a seed internally so tests and prepared replay can
reproduce an exact deck.

## Current limitations

- End-to-end, viewport, offline-request, and reduced-motion automation are Phase 4.
- A 60-minute booth burn-in and independent runbook rehearsal have not occurred.
