import { describe, expect, it } from "vitest";
import { scenarios } from "./index";
import { assertValidScenario, validateScenario, validateScenarios } from "./validate";

describe("scenario validation", () => {
  const accountWarning = scenarios.find((scenario) => scenario.familyId === "urgent-account-warning")!;

  it("accepts every curated variant", () => {
    expect(scenarios).toHaveLength(10);
    expect(validateScenarios(scenarios)).toEqual([]);
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
