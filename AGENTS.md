# Coding agent guidance

Inspect the repository and present a concise plan before editing. Work in small,
testable phases and preserve unrelated changes.

This project is a defensive, local-first public awareness demonstration:

- Never add credential collection, visitor-data storage, real login flows,
  active QR destinations, external links, tracking, analytics, or offensive tools.
- Keep all scenario identities and addresses fictional and use only reserved
  `example.com`, `example.org`, and `example.net` domains.
- Keep runtime assets local and minimise dependencies. Do not add a backend
  without a documented need.
- Maintain keyboard and touchscreen use, semantic HTML, visible focus, adequate
  contrast, reduced-motion support, and indicators that do not rely on colour.
- Keep scenario content separate from rendering. Add logic and reset tests when
  behaviour changes, and run scenario safety validation.
- Randomness may only choose or order reviewed local variants. Preserve seeded
  reproducibility for tests and prepared replay; do not generate scenario text.
- Reset must remove all session state. Keep attract and, once introduced, replay
  modes functional.
- Never silently allocate an Open Day port. Development host and port must remain
  configurable, must fail on conflicts, and must not use ModelDeck-owned ports.
- Use Australian English in documentation, comments, and visitor-facing copy.

Do not call the project Open Day ready until every readiness gate in
`docs/ROADMAP.md` has been met and the port is recorded in OpenDayOps.
