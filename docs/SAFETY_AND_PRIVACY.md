# Safety and privacy

## Required controls

- Use fictional names and reserved `example.com`, `example.org`, or `example.net`
  domains only.
- Render URLs as inert text. Do not add live external links or active QR codes.
- Never create password fields, login submission, visitor free text, identity
  fields, analytics, tracking, persistent scores, or interaction telemetry.
- Do not add scanning, exploitation, malware, payloads, credential attacks, or
  domain impersonation of a real organisation.
- Package all scenario content and runtime assets locally.
- Only select from reviewed local variants; never generate or fetch scenario text.

The scenario validator checks every materialised variant and rejects executable
or form markup, active destination fields, malformed evidence, and non-allowlisted
domains. It also verifies each cipher shift and its authored plaintext. Source
validation scans all six family files. Tests also guard against
credential and personal-data input markup. Validation is defence in depth; every
content change still requires human review.

Production-browser journeys also monitor runtime requests and fail if the page
contacts an origin other than its local preview server. Offline coverage switches
the loaded browser context offline and completes a full visitor journey, guarding
the local-only runtime assumption.

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

## Incident response

If unexpected content, a live destination, or retained visitor state is observed:

1. Stop public use and close the browser tab.
2. Disconnect the booth device from the network if external activity is suspected.
3. Record the local build/version and notify the booth lead.
4. Restore a reviewed build, run scenario validation and the smoke test, then reset.

Do not improvise with visitor data or copy it into an incident report.
