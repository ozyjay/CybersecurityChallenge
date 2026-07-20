import { readdir, readFile } from "node:fs/promises";

const scenarioDirectory = new URL("../src/scenarios/", import.meta.url);
const ignoredFiles = new Set(["index.ts", "randomise.ts", "validate.ts"]);
const fileNames = (await readdir(scenarioDirectory))
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !ignoredFiles.has(name));
const sources = await Promise.all(fileNames.map(async (name) => ({ name, source: await readFile(new URL(name, scenarioDirectory), "utf8") })));

const allowed = ["example.com", "example.org", "example.net"];
const forbidden = [
  /<script/i,
  /<input/i,
  /type=["']password/i,
  /javascript:/i,
  /data:text\/html/i,
  /\b(?:qrDestination|submitUrl|trackingUrl|formAction)\s*:/i
];

const errors = [];
if (sources.length < 5) errors.push(`Expected at least five scenario family files, found ${sources.length}.`);

for (const { name, source } of sources) {
  if (!/satisfies Scenario/.test(source)) errors.push(`${name}: scenario must satisfy the typed Scenario contract.`);
  if (forbidden.some((pattern) => pattern.test(source))) errors.push(`${name}: active or executable content was found.`);
  const domains = [...source.matchAll(/(?:https?:\/\/|@)([a-z0-9.-]+\.[a-z]{2,})/gi)].map((match) => match[1].toLowerCase());
  for (const domain of domains) {
    if (!allowed.some((item) => domain === item || domain.endsWith(`.${item}`))) errors.push(`${name}: unexpected domain ${domain}.`);
  }
}

if (errors.length) {
  console.error(`Scenario safety validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}
console.log(`Scenario safety validation passed for ${sources.length} scenario files (reserved domains and inert content only).`);
