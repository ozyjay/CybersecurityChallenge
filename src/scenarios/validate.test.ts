import { describe, expect, it } from "vitest";
import { scenarios } from "./index";
import { assertValidScenario, validateScenario, validateScenarios } from "./validate";
import type { CipherScenario, InvestigationScenario } from "../types/scenario";

describe("scenario validation", () => {
  const accountWarning = scenarios.find((scenario): scenario is InvestigationScenario => scenario.activity === "investigation" && scenario.familyId === "urgent-account-warning")!;
  const cipher = scenarios.find((scenario): scenario is CipherScenario => scenario.activity === "cipher")!;

  it("accepts every curated variant", () => {
    expect(scenarios).toHaveLength(12);
    expect(validateScenarios(scenarios)).toEqual([]);
  });

  it("rejects invalid and inconsistent cipher content", () => {
    expect(validateScenario({ ...cipher, content: { ...cipher.content, shift: 26 } })).toContain("Cipher shift must be an integer from 1 to 25.");
    expect(validateScenario({ ...cipher, content: { ...cipher.content, plaintext: "A DIFFERENT MESSAGE" } })).toContain("Ciphertext, plaintext, and shift do not match.");
    expect(validateScenario({ ...cipher, content: { ...cipher.content, hints: ["Only one hint"] } })).toContain("Cipher content requires exactly two non-empty hints.");
  });

  it("rejects unsafe domains and executable markup", () => {
    const unsafe = { ...accountWarning, title: "Visit https://real.invalid now <script>alert(1)</script>" };
    expect(() => assertValidScenario(unsafe)).toThrow(/not allowlisted|markup/);
  });

  it("rejects malformed scenarios and unsupported clue regions", () => {
    const malformed = {
      ...accountWarning,
      id: "",
      content: { ...accountWarning.content, subject: "" },
      clues: [{ ...accountWarning.clues[0], selectableRegion: "unknown-region" }]
    };
    expect(validateScenario(malformed)).toEqual(expect.arrayContaining([
      expect.stringMatching(/non-empty id/i),
      expect.stringMatching(/non-empty subject/i),
      expect.stringMatching(/unsupported email selectable region/i)
    ]));
  });

  it("rejects duplicate scenario ids across the catalogue", () => {
    expect(validateScenarios([accountWarning, accountWarning])).toContain("Scenario ids must be unique across the catalogue.");
  });

  it.each(scenarios)("keeps $id free of active controls and personal-data fields", (scenario) => {
    const serialised = JSON.stringify(scenario);
    expect(serialised).not.toMatch(/<input|type=["']password|name=["']email|qrDestination|submitUrl|trackingUrl/i);
  });
});
