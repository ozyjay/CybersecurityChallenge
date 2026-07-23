# Demo runbook

## Cold start

1. Open a terminal in the project directory.
2. Set `APP_HOST` and the approved development port if defaults are unsuitable.
3. Run `npm run validate:scenarios`, `npm test`, then `npm run dev`.
4. Open the printed local URL and use browser fullscreen mode if desired.

The default `4173` port is for development only. Do not present it as an event
allocation.

## Pre-event verification

Install Playwright-managed Chromium once on the booth machine after `npm install`:

```bash
npm run install:browsers
```

Before rehearsal, run the scenario validator, unit/component suite, production
build and browser journeys:

```bash
npm run validate:scenarios
npm test
npm run build
npm run test:e2e
```

On Windows PowerShell, the equivalent single command is:

```powershell
.\scripts\test.ps1
```

The browser suite uses isolated local port `4174` by default and fails if it is
occupied. This is an automated-test default, not an event allocation. Set a
different permitted test port with `E2E_PORT` when required.

The project launchers execute local tools through the active Node process and do
not call `npx` or a system browser. Snap-packaged Chromium is deliberately ignored
because its confinement can prevent reliable Playwright automation. If an
installed package-manager shim is also confined, run `node scripts/run-e2e.mjs`
or the corresponding direct script documented in the README.

Run the stability exercise on the intended booth machine and build:

```bash
npm run test:burn-in
```

On Windows PowerShell:

```powershell
.\scripts\test.ps1 -BurnInMinutes 10
```

It runs for 10 minutes by default, repeatedly completes a visitor case, exercises
replay interruption every ten cycles, and fails on page errors, console errors or
external requests. A `BURN_IN_MINUTES` value below 10 may shorten local proof
runs, but does not satisfy the readiness gate. Record the date, version, machine,
duration, completed cycles and outcome in the event verification record.

Start and stop the production build on the formally approved event port:

```powershell
.\scripts\run.ps1 -AppPort 4175
.\scripts\stop.ps1
```

Replace `4175` with the port recorded by OpenDayOps.

For phones connected to the booth computer's approved hotspot, bind the server
to all local interfaces:

```powershell
.\scripts\run.ps1 -AppHost 0.0.0.0 -AppPort <approved-port>
```

The runner prints labelled private IPv4 addresses. Use the Windows Mobile
Hotspot address for visitor instructions and verify it from a phone before the
session. Do not treat the displayed development or test addresses as an event
allocation.

If a hotspot phone cannot connect while the booth computer can open the hotspot
URL, enable the demo-only firewall rule and approve the Windows Administrator
prompt:

```powershell
.\scripts\firewall.cmd -Action Enable -AppPort <approved-port>
```

Inspect or disable that same rule without changing unrelated firewall policy:

```powershell
.\scripts\firewall.cmd -Action Status  -AppPort <approved-port>
.\scripts\firewall.cmd -Action Disable -AppPort <approved-port>
```

The command launcher bypasses script execution policy only for its child
PowerShell process and does not make a persistent policy change. Status is
read-only, but may request Administrator approval when Windows restricts firewall
rule queries. The rule permits edge traversal only for the selected demo port,
project-local demo Node runtime, hotspot address and hotspot client subnet.
Windows-wide allow or block rules for the installed Node executable are left
unchanged.

## Trusted onboarding QR

The fictional campus Wi-Fi scenario remains non-scannable. Any live QR shown to
visitors must be a separate staff-controlled onboarding code and may encode only:

- the approved Windows 10 Mobile Hotspot connection payload; or
- the allowlisted private demo URL printed by the production runner.

Before displaying it:

1. Confirm the hotspot SSID and passphrase are the approved event values.
2. Confirm the demo is bound to `0.0.0.0` on the OpenDayOps-approved port.
3. Confirm the scoped firewall rule is enabled only for `.demo-runtime\node.exe`,
   the accepted port, `192.168.137.1`, and `192.168.137.0/24`.
4. Generate the QR from explicit staff configuration. Do not copy a payload from
   scenario content, visitor input, a remote page, or an unreviewed QR generator.
5. Display the human-readable SSID or private URL beside the QR.
6. Scan it with a separate iPhone and Android device. Confirm it joins the
   intended hotspot or opens exactly the expected private page.
7. Confirm the phone cannot reach staff-only controls, file sharing, Windows
   administration, ModelDeck, or unrelated local services.
8. Keep a printed SSID and typed private URL available as the no-QR fallback.

Do not commit or log the hotspot passphrase, place it in screenshots or replay
assets, or reuse it after the event without deliberate approval. Cover or remove
the onboarding QR whenever the hotspot or demo service is stopped.

## Smoke test

1. Confirm the attract screen, **Tap to begin**, and privacy statement are visible.
2. Use Tab and Enter to open the nine-case selection; choose an investigation and select
   and deselect a clue.
3. Make a decision, inspect all evidence cards, and view the result.
4. Select **Choose the next case** and confirm the case list returns with no
   previous clue count, decision, score, or result. If the same scenario family
   is selected again, confirm its wording is the reviewed alternative variant.
5. Start a different scenario, use **Reset for next visitor**, and repeat once
   with touch or mouse input. Confirm the case order or wording may change while
   remaining within the prepared scenario set and no prior completion is retained.
6. Open each cipher family and confirm its tailored controls: shift dial,
   mirrored-alphabet buttons, Polybius coordinate grid, and reviewed Vigenère
   keyword cards. Request hints, try an incorrect lock-in, and complete one
   decryption. Confirm reset removes all selections, word progress, hints,
   attempts, and score.
7. If the trusted onboarding QR is enabled, repeat its verification from a fresh
   phone connection and confirm the fictional QR-style poster is still not
   scannable.

## Staff controls

Open the demo's `/staff` route on the booth display. The visitor route does not
render staff controls. On `/staff`, open the panel using **Staff** or
`Ctrl+Alt+S`; press Escape to close it.

- **Timer enabled**: standard 45-second investigation timer.
- **Relaxed 90-second timer**: doubles the timer without changing scoring.
- **Optional sound cues**: local cues only; disabled by default and never required.
- **Difficulty**: show all, starter-only, or intermediate-only visitor cases.
- **Prepared case**: choose the exact local variant for staff start or replay.
- **Loop automatically**: repeat replay across the seeded deck.
- **Return to attract screen** and **Reset for next visitor**: clean booth recovery.

## Prepared replay

1. Open staff controls and choose a prepared case.
2. Leave **Loop automatically** enabled for passive booth display, or disable it
   for a single walkthrough.
3. Select **Start prepared replay**.
4. Confirm the prepared-demonstration label remains visible while the selected
   investigation or cipher, reveal, and result advance automatically.
5. Tap the screen or press any key. Confirm replay stops immediately at attract.

Replay is deterministic for a given seed, requires no network access, does not
run the visitor timer, and never uses generated content.

## Staff script

“Scan the separate connection code only if you want to join this approved local
hotspot. The QR-style poster inside the challenge is fictional and deliberately
not scannable. Choose anything in the fictional message that feels suspicious,
or rotate the alphabet to decode the cipher. There’s no personal information to
enter, and all scenario links are inactive.”

## Reset and troubleshooting

Use **Reset for next visitor** from the header or result. If display state is
uncertain, refresh the page; all state is memory-only. If startup reports an
occupied port, stop the process using that port or select another permitted
development port—do not let Vite choose one silently. If assets fail to load,
restart the local server and repeat the smoke test.

If replay does not advance, tap once to interrupt it, use **Reset for next
visitor**, and start it again from staff controls.

If the onboarding QR opens an unexpected destination, remove or cover it
immediately, disable the scoped firewall rule, stop the hotspot, and follow the
incident procedure in `docs/SAFETY_AND_PRIVACY.md`.

## Shutdown

1. Cover or remove the onboarding QR.
2. Close the demo tab and press Ctrl+C once in the server terminal.
3. Confirm the process exits.
4. Disable the demo firewall rule.
5. Stop the Windows hotspot.
6. Rotate or retire the event hotspot passphrase as planned.

No visitor-data clean-up is needed because none is persisted.

## Gate sign-off

After an independent operator completes this runbook on the intended booth
machine, record the measured instruction timing and each human check in
`docs/OPEN_DAY_ACCEPTANCE.md`. OpenDayOps must then record and accept the event
port and presentation rotation in the same acceptance record. Development and
automated-test ports are not event allocations.
