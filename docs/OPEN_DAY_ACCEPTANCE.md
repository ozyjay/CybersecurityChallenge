# Open Day acceptance record

Complete this record on the intended booth machine. Do not mark the project Open
Day ready until both sections are complete and the OpenDayOps registry reference
has been verified.

## Independent operator rehearsal

The operator must be someone unfamiliar with the codebase and must follow
`docs/DEMO_RUNBOOK.md` without developer assistance.

- Operator:
- Rehearsal date and time:
- Booth machine:
- Browser and version:
- Production build or commit:
- [ ] Opened and reviewed all nine scenario families
- [ ] Visitor instructions were understood within 10–20 seconds
- Fastest observed instruction time:
- Slowest observed instruction time:
- [ ] Reset cleared every visitor selection, decision, cipher state, hint, attempt, and score
- [ ] Prepared offline replay started, advanced, looped, and stopped on touch and keyboard input
- [ ] Privacy and safety wording was clear; no personal information was requested
- [ ] Staff controls were found and operated from the runbook
- [ ] Keyboard-only operation completed a visitor journey
- [ ] Touch operation completed a visitor journey on the intended display
- [ ] Visible focus, contrast, selected states, and non-colour status indicators were acceptable
- [ ] The operator could recover from an occupied port and return the demo to the attract screen
- Operator outcome: `accepted` / `changes required`
- Operator notes:

## OpenDayOps acceptance

OpenDayOps has allocated fixed event port `4175`. Development port `4173` and
automated-test port `4174` remain non-event defaults.

- Event host or booth identifier: Windows 10 hotspot booth PC
- Approved event port: `4175`
- Approved visitor bind: `0.0.0.0:4175`
- Approved visitor URL: `http://<Windows-Mobile-Hotspot-IP>:4175`
- Port conflict check date and time:
- Presentation rotation or scheduled slot:
- OpenDayOps registry reference: `PORTS_AND_LOCAL_SERVICES.md`
- OpenDayOps decisions-log reference: 2026-07-24 port allocation decision
- Accepted by: Jase
- Acceptance date: 2026-07-24
- [x] Event port is recorded in OpenDayOps
- [ ] Presentation rotation is recorded in OpenDayOps
- [x] Port has been formally accepted

## Final readiness decision

- [ ] Independent operator rehearsal accepted
- [ ] Current automated verification in `docs/VERIFICATION.md` passed
- [ ] OpenDayOps acceptance completed, including presentation rotation
- Decision: `Open Day ready` / `not ready`
- Decision made by:
- Decision date and time:
