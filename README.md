# Can You Spot the Scam?

A polished, local-first cybersecurity awareness game for a university Open Day
booth. Visitors inspect a fictional message, flag warning signs, choose a safe
response, and receive concise educational feedback.

## Status

The current build includes nine curated fictional scenario families with eighteen reviewed
variants: an urgent account email, campus Wi-Fi poster, internship direct
message, shared-document sign-in page, a genuinely safe notification, and four
local cipher puzzles covering Caesar, Atbash, Polybius, and Vigenère methods. Each
round selects one local variant per family and shuffles the case order.
Investigation cases support clue selection and a safety decision; cipher cases
use tailored decoding controls. Every case includes a reveal, educational
scoring, and a clean one-action reset. Booth operation now
includes an attract screen, optional standard or relaxed timer, sound-off default,
difficulty filtering, direct staff scenario selection, and prepared offline
replay. Phase 4 adds production-build browser journeys for visitor, keyboard,
touch, compact viewport, reduced-motion, offline, staff, replay, reset, repeated
cycle, runtime-network, and port-policy behaviour, plus a timed burn-in runner.

The project is **not yet Open Day ready**. Complete the independent rehearsal and
OpenDayOps fields in `docs/OPEN_DAY_ACCEPTANCE.md`; no formal event port has been
allocated.

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
npm run install:browsers    # install Playwright-managed Chromium once
npm run test:e2e            # build and run production-browser journeys
npm run test:burn-in         # build and run the 10-minute stability exercise
```

For a simpler Windows PowerShell workflow, use the wrappers in `scripts/`:

```powershell
.\scripts\setup.ps1
.\scripts\test.ps1
.\scripts\test.ps1 -BurnInMinutes 10
.\scripts\run.ps1 -AppPort 4175
.\scripts\stop.ps1
```

`scripts/setup.ps1` first stops this repository's running Vite servers so Windows
can safely replace native dependencies, then installs the locked dependencies
and Playwright-managed Chromium. `scripts/test.ps1` runs safety, unit, build, and
production-browser checks; burn-in is only included when `-BurnInMinutes` is supplied.
`scripts/run.ps1` builds and serves
`dist/`, requires an explicit permitted port, and fails if that port is occupied.
Use `-SkipBuild` only when the existing production build is known to be current.
`scripts/stop.ps1` discovers and stops every listener verified as this
repository's Vite server, regardless of its configured port. It ignores all
unrelated software. Use `-WhatIf` to inspect the exact processes first.

To let phones on the same approved hotspot or local network open the demo, bind
to all local interfaces:

```powershell
.\scripts\run.ps1 -AppHost 0.0.0.0 -AppPort <approved-port>
```

Replace `<approved-port>` with the OpenDayOps allocation. The runner prints the
booth-computer address and each usable private phone address, prioritising the
Windows Mobile Hotspot adapter. It never prints loopback or automatic
`169.254.x.x` fallback addresses as phone destinations.

If Windows Firewall blocks hotspot phones, manage the demo's narrowly scoped
rule:

```powershell
.\scripts\firewall.cmd -Action Enable  -AppPort <approved-port>
.\scripts\firewall.cmd -Action Status  -AppPort <approved-port>
.\scripts\firewall.cmd -Action Disable -AppPort <approved-port>
```

The rule applies only to the detected `node.exe`, the selected TCP port, local
address `192.168.137.1`, and remote hotspot subnet `192.168.137.0/24`. Disabling
it does not alter unrelated Node or Windows Firewall rules. The command launcher
uses an execution-policy bypass only for its child PowerShell process; it does not
change the computer's execution policy. The commands request Administrator
approval through the standard Windows prompt when the current account cannot
query firewall rules; Status remains read-only.

Project scripts launch the checked-in dependency versions from `node_modules`
through the active Node executable. They do not rely on `npx`, globally installed
tools, or Snap-packaged Chromium. If a confined package-manager shim is still
unreliable, use the equivalent direct entry points:

```bash
node scripts/start-dev.mjs
node scripts/build.mjs
node scripts/run-vitest.mjs run
node scripts/run-e2e.mjs
```

Browser checks deliberately require Playwright-managed Chromium. Install it with
`npm run install:browsers`, or directly with
`node scripts/install-playwright-browser.mjs`; this is the only step that downloads
a browser and should be completed before offline event use.

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

Select **Tap to begin** and choose one of nine cases. Investigation cases ask you
to flag suspicious regions and make a safety decision; cipher cases provide a
method-specific shift dial, mirrored alphabet, coordinate square, or reviewed
keyword choices. Review the reveal and
view the result. **Reset for next visitor** or **Choose the next
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
reproduce an exact deck. Add `?seed=2026` to a local URL to replay a prepared
unsigned 32-bit seed; invalid values fall back to normal session randomness.

## Current limitations

- An independent operator still needs to complete the runbook rehearsal.
- The event port and presentation rotation still require OpenDayOps acceptance.
