import type { Scenario } from "../types/scenario";

const allowedDomains = ["example.com", "example.org", "example.net"];
const unsafeMarkup = /<\/?(?:script|iframe|form|input)\b|javascript:/i;
const urlPattern = /https?:\/\/([^\s/]+)/gi;
const emailPattern = /[\w.+-]+@([\w.-]+\.[a-z]{2,})/gi;

export function validateScenario(scenario: Scenario): string[] {
  const errors: string[] = [];
  if (!scenario.id || !scenario.title || scenario.clues.length === 0) {
    errors.push("Scenario requires an id, title, and at least one clue.");
  }

  const ids = scenario.clues.map((clue) => clue.id);
  if (new Set(ids).size !== ids.length) errors.push("Clue ids must be unique.");

  const serialised = JSON.stringify(scenario);
  if (unsafeMarkup.test(serialised)) errors.push("Executable or form markup is not allowed.");

  for (const pattern of [urlPattern, emailPattern]) {
    pattern.lastIndex = 0;
    for (const match of serialised.matchAll(pattern)) {
      const domain = match[1].toLowerCase();
      if (!allowedDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`))) {
        errors.push(`Domain is not allowlisted: ${domain}`);
      }
    }
  }
  return errors;
}

export function assertValidScenario(scenario: Scenario): void {
  const errors = validateScenario(scenario);
  if (errors.length) throw new Error(errors.join("\n"));
}
