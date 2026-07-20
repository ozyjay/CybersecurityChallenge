import { readFile } from "node:fs/promises";

const path = new URL("../src/scenarios/accountWarning.ts", import.meta.url);
const source = await readFile(path, "utf8");
const allowed = ["example.com", "example.org", "example.net"];
const forbidden = [/<script/i, /<input/i, /type=["']password/i, /javascript:/i, /qrDestination/i];
const domains = [...source.matchAll(/(?:https?:\/\/|@)([a-z0-9.-]+\.[a-z]{2,})/gi)].map((match) => match[1].toLowerCase());
const unsafeDomains = domains.filter((domain) => !allowed.some((item) => domain === item || domain.endsWith(`.${item}`)));

if (forbidden.some((pattern) => pattern.test(source)) || unsafeDomains.length) {
  console.error(`Scenario safety validation failed${unsafeDomains.length ? `: unexpected domains ${unsafeDomains.join(", ")}` : "."}`);
  process.exit(1);
}
console.log("Scenario safety validation passed (reserved domains and inert content only). ");
