# Safety and privacy

## Required controls

- Use fictional names and reserved `example.com`, `example.org`, or `example.net`
  domains only.
- Render scenario URLs as inert text. Fictional scam QR artwork must remain
  non-scannable and must never contain an active destination.
- A separate staff-controlled onboarding QR may be generated only for:
  - the approved Windows 10 Mobile Hotspot connection payload; or
  - an allowlisted private demo URL served by this repository on that hotspot.
- Keep the onboarding QR visually and structurally separate from all fictional
  scenarios. Display the human-readable SSID or private URL beside it so staff
  and visitors can verify the destination before scanning.
- Do not accept a QR payload from visitor input, scenario content, query strings,
  remote configuration, clipboard contents, or an external service. The payload
  must come from explicit staff configuration for the current event session.
- Do not encode a real personal account, campus credential, staff-only route,
  ModelDeck address, file share, administration interface, or internet URL.
- Treat the hotspot passphrase as an event access secret: do not commit it, write
  it to logs, include it in screenshots or fallback assets, or retain it after
  pack-out. Rotate it after the event or sooner if unexpectedly disclosed.
- Never create password fields, login submission, visitor free text, identity
  fields, analytics, tracking, persistent scores, or interaction telemetry.
- Do not add scanning, exploitation, malware, payloads, credential attacks, or
  domain impersonation of a real organisation.
- Package all scenario content and runtime assets locally.
- Only select from reviewed local variants; never generate or fetch scenario text.

The scenario validator checks every materialised variant and rejects executable
or form markup, active destination fields, malformed evidence, and non-allowlisted
domains. It also verifies each cipher method and its authored plaintext. Source
validation scans all nine family files. Tests also guard against credential and
personal-data input markup. The onboarding QR exception does not apply to
scenario data and must not weaken these checks. Validation is defence in depth;
every content change still requires human review.

Production-browser journeys also monitor runtime requests and fail if the page
contacts an origin other than its local preview server. Offline coverage switches
the loaded browser context offline and completes a full visitor journey, guarding
the local-only runtime assumption. A trusted onboarding QR may point phones to
the same approved private origin; it does not permit the application to make
external requests.

## Hotspot and firewall boundary

The approved event path uses the Windows 10 Mobile Hotspot and the repository's
project-scoped `.demo-runtime\node.exe` copy. The firewall rule must remain
limited to that executable, the accepted TCP port, local hotspot address
`192.168.137.1`, and remote hotspot subnet `192.168.137.0/24`.

Do not expose staff-only controls, file sharing, Windows administration,
ModelDeck management or workers, unrelated local services, or broad port ranges
to hotspot clients. Disable the demo firewall rule after rehearsal or shutdown
when visitor access is no longer needed.

Before displaying the onboarding QR, staff must verify from a separate phone
that it joins the intended hotspot or opens the expected private demo page. A
printed SSID and typed private URL must remain available as the no-QR fallback.

## Storage and reset policy

Visitor interactions live only in volatile component state. Nothing is written to
cookies, local storage, files, logs, or a remote service. **Reset for next visitor**
clears clue selection, decision, score, and result by restoring initial state.
It also clears the temporary completed-variant exclusion. Continuing with
**Choose the next case** retains only the immediately completed variant identifier
in memory so that exact variant is not offered twice in succession.

Timer, staff, and replay settings also remain in volatile page memory. Prepared
replay selects only authored clues and decisions from the validated local
catalogue. Optional sound cues are synthesised locally through the browser and
are disabled by default; sound is never required to complete a case.

The onboarding QR must not create visitor accounts, track scans, or persist a
visitor identifier. Resetting the game does not need to disconnect a visitor's
phone from the hotspot; staff clear access by stopping the hotspot or rotating
its passphrase according to the event shutdown procedure.

## Incident response

If unexpected content, an unapproved live destination, or retained visitor state
is observed:

1. Stop public use and remove or cover the onboarding QR.
2. Close the browser tab and disable the demo firewall rule.
3. Stop the hotspot if external activity or an incorrect QR payload is suspected.
4. Record the local build/version and notify the booth lead without recording
   visitor details or the hotspot passphrase.
5. Restore a reviewed build, run scenario validation and the smoke test, verify
   the QR payload from a separate phone, then reset.

Do not improvise with visitor data or copy it into an incident report.
