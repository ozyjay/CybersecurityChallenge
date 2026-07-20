import type { Scenario, ScenarioContent } from "../types/scenario";

const allowedDomains = ["example.com", "example.org", "example.net"];
const unsafeMarkup = /<\/?(?:script|iframe|form|input|button|object|embed)\b|javascript:|data:text\/html/i;
const urlPattern = /https?:\/\/([^\s/"']+)/gi;
const emailPattern = /[\w.+-]+@([\w.-]+\.[a-z]{2,})/gi;

const regionsByKind: Record<ScenarioContent["kind"], readonly string[]> = {
  email: ["sender", "recipient", "subject", "greeting", "paragraph-0", "paragraph-1", "action", "signoff"],
  message: ["sender", "heading", "paragraph-0", "pay", "deadline", "platform", "payment", "company"],
  qr: ["organisation", "headline", "offer", "qr", "installation", "permissions", "support"],
  login: ["url", "brand", "document", "sender", "context", "credentials", "support"]
};

const expectedCategory: Record<ScenarioContent["kind"], Scenario["category"]> = {
  email: "email",
  message: "sms",
  qr: "qr",
  login: "login"
};

const requiredContent: Record<ScenarioContent["kind"], { strings: readonly string[]; arrays: readonly string[] }> = {
  email: { strings: ["displayName", "sender", "recipient", "subject", "greeting", "actionLabel", "actionUrl", "signoff"], arrays: ["paragraphs"] },
  message: { strings: ["channelLabel", "sender", "receivedAt", "heading", "payOffer", "deadline", "platformRequest", "paymentRequest", "companyDetails"], arrays: ["paragraphs"] },
  qr: { strings: ["organisation", "headline", "offer", "scanLabel", "displayedUrl", "installationRequest", "supportText"], arrays: ["permissions"] },
  login: { strings: ["serviceName", "pageUrl", "documentTitle", "sharedBy", "context", "credentialPrompt", "actionLabel", "supportText"], arrays: [] }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function presentString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function collectEmptyStrings(value: unknown, path = "scenario"): string[] {
  if (typeof value === "string") return value.trim() ? [] : [`${path} must not be empty.`];
  if (Array.isArray(value)) return value.flatMap((entry, index) => collectEmptyStrings(entry, `${path}[${index}]`));
  if (isRecord(value)) return Object.entries(value).flatMap(([key, entry]) => collectEmptyStrings(entry, `${path}.${key}`));
  return [];
}

export function validateScenario(value: unknown): string[] {
  if (!isRecord(value)) return ["Scenario must be an object."];

  const errors: string[] = [];
  if (!presentString(value.id) || !presentString(value.familyId) || !presentString(value.variantId) || !presentString(value.title)) {
    errors.push("Scenario requires non-empty id, familyId, variantId, and title fields.");
  }
  for (const field of ["introduction", "takeaway", "careerConnection"] as const) {
    if (!presentString(value[field])) errors.push(`Scenario requires a non-empty ${field}.`);
  }
  if (!presentString(value.category) || !["email", "sms", "qr", "login", "permissions"].includes(value.category)) {
    errors.push("Scenario requires a supported category.");
  }
  if (!presentString(value.difficulty) || !["starter", "intermediate"].includes(value.difficulty)) {
    errors.push("Scenario requires a supported difficulty.");
  }
  if (!isRecord(value.content) || !presentString(value.content.kind) || !(value.content.kind in regionsByKind)) {
    errors.push("Scenario requires a supported content kind.");
  }
  if (!Array.isArray(value.clues)) errors.push("Scenario requires a clue list.");
  if (Array.isArray(value.clues) && value.clues.length === 0 && value.correctDecision !== "safe") {
    errors.push("A non-safe scenario requires at least one clue.");
  }
  if (!Array.isArray(value.decoys) || value.decoys.length === 0) errors.push("Scenario requires at least one curated benign region.");
  if (!presentString(value.correctDecision) || !["safe", "suspicious", "escalate"].includes(value.correctDecision)) {
    errors.push("Scenario requires a supported correct decision.");
  }

  errors.push(...collectEmptyStrings(value));

  if (Array.isArray(value.clues) && Array.isArray(value.decoys)) {
    const evidence = [...value.clues, ...value.decoys];
    for (const item of evidence) {
      if (!isRecord(item)) {
        errors.push("Every clue and benign region must be an object.");
        continue;
      }
      if (!presentString(item.label) || !presentString(item.explanation)) errors.push("Every clue and benign region requires a label and explanation.");
    }
    for (const clue of value.clues) {
      if (!isRecord(clue) || !presentString(clue.severity) || !["low", "medium", "high"].includes(clue.severity)) {
        errors.push("Every clue requires a supported severity.");
      }
    }
    const ids = evidence.flatMap((item) => isRecord(item) && presentString(item.id) ? [item.id] : []);
    if (ids.length !== evidence.length) errors.push("Every clue and benign region requires a non-empty id.");
    if (new Set(ids).size !== ids.length) errors.push("Evidence ids must be unique.");

    const regions = evidence.flatMap((item) => isRecord(item) && presentString(item.selectableRegion) ? [item.selectableRegion] : []);
    if (regions.length !== evidence.length) errors.push("Every clue and benign region requires a selectable region.");
    if (new Set(regions).size !== regions.length) errors.push("Selectable regions must be unique within a scenario.");

    if (isRecord(value.content) && presentString(value.content.kind) && value.content.kind in regionsByKind) {
      const kind = value.content.kind as ScenarioContent["kind"];
      const supported = regionsByKind[kind];
      const required = requiredContent[kind];
      for (const field of required.strings) {
        if (!presentString(value.content[field])) errors.push(`${kind} content requires a non-empty ${field}.`);
      }
      for (const field of required.arrays) {
        const entries = value.content[field];
        if (!Array.isArray(entries) || entries.length === 0 || entries.some((entry) => !presentString(entry))) {
          errors.push(`${kind} content requires a non-empty ${field} list.`);
        }
      }
      for (const region of regions) {
        if (!supported.includes(region)) errors.push(`Unsupported ${kind} selectable region: ${region}`);
      }
      if (value.category !== expectedCategory[kind]) errors.push(`Content kind ${kind} does not match category ${String(value.category)}.`);
    }
  }

  const serialised = JSON.stringify(value);
  if (unsafeMarkup.test(serialised)) errors.push("Executable, interactive, or form markup is not allowed.");
  if (/"(?:qrDestination|href|formAction|submitUrl|trackingUrl)"\s*:/i.test(serialised)) {
    errors.push("Active destination or tracking fields are not allowed.");
  }

  for (const pattern of [urlPattern, emailPattern]) {
    pattern.lastIndex = 0;
    for (const match of serialised.matchAll(pattern)) {
      const domain = match[1].toLowerCase().replace(/[),.;]+$/, "");
      if (!allowedDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`))) {
        errors.push(`Domain is not allowlisted: ${domain}`);
      }
    }
  }
  return [...new Set(errors)];
}

export function assertValidScenario(scenario: unknown): asserts scenario is Scenario {
  const errors = validateScenario(scenario);
  if (errors.length) throw new Error(errors.join("\n"));
}

export function validateScenarios(values: unknown): string[] {
  if (!Array.isArray(values) || values.length === 0) return ["Scenario catalogue must contain at least one scenario."];
  const errors = values.flatMap((scenario, index) => validateScenario(scenario).map((error) => `Scenario ${index + 1}: ${error}`));
  const ids = values.flatMap((scenario) => isRecord(scenario) && presentString(scenario.id) ? [scenario.id] : []);
  if (new Set(ids).size !== ids.length) errors.push("Scenario ids must be unique across the catalogue.");
  return errors;
}

export function assertValidScenarios(values: unknown): asserts values is Scenario[] {
  const errors = validateScenarios(values);
  if (errors.length) throw new Error(errors.join("\n"));
}
