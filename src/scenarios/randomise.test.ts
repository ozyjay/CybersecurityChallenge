import { describe, expect, it } from "vitest";
import { buildScenarioDeck, scenarioFamilies, scenarios } from "./index";
import type { InvestigationScenario } from "../types/scenario";

describe("seeded scenario randomisation", () => {
  it("returns one reviewed variant from every family", () => {
    const deck = buildScenarioDeck(12345);
    expect(deck).toHaveLength(scenarioFamilies.length);
    expect(new Set(deck.map((scenario) => scenario.familyId)).size).toBe(scenarioFamilies.length);
    expect(deck.every((scenario) => scenarios.some((variant) => variant.id === scenario.id))).toBe(true);
  });

  it("is reproducible for staff, replay, and tests", () => {
    expect(buildScenarioDeck(8675309).map((scenario) => scenario.id)).toEqual(buildScenarioDeck(8675309).map((scenario) => scenario.id));
  });

  it("produces varied prepared decks across seeds", () => {
    const signatures = new Set(Array.from({ length: 20 }, (_, seed) => buildScenarioDeck(seed).map((scenario) => scenario.id).join("|")));
    expect(signatures.size).toBeGreaterThan(5);
  });

  it("replaces an excluded variant with its reviewed family alternative", () => {
    const firstDeck = buildScenarioDeck(321);
    const completed = firstDeck[0];
    const nextDeck = buildScenarioDeck(322, [completed.id]);
    const sameFamily = nextDeck.find((scenario) => scenario.familyId === completed.familyId)!;
    expect(sameFamily.id).not.toBe(completed.id);
    expect(scenarios).toContainEqual(sameFamily);
  });

  it("falls back safely if every variant in a family is excluded", () => {
    const family = scenarioFamilies[0];
    const familyVariantIds = scenarios.filter((scenario) => scenario.familyId === family.id).map((scenario) => scenario.id);
    const deck = buildScenarioDeck(99, familyVariantIds);
    expect(deck.some((scenario) => scenario.familyId === family.id)).toBe(true);
  });

  it("includes a genuinely safe family alongside suspicious cases", () => {
    const safeVariants = scenarios.filter((scenario): scenario is InvestigationScenario => scenario.activity === "investigation" && scenario.correctDecision === "safe");
    expect(safeVariants).toHaveLength(2);
    expect(safeVariants.every((scenario) => scenario.clues.length === 0 && scenario.decoys.length > 0)).toBe(true);
  });

  it("allows reviewed variants to move evidence without breaking its explanation", () => {
    const accountVariants = scenarios.filter((scenario): scenario is InvestigationScenario => scenario.activity === "investigation" && scenario.familyId === "urgent-account-warning");
    const credentialRegions = accountVariants.map((scenario) => scenario.clues.find((clue) => clue.id === "credential-request")?.selectableRegion);
    expect(new Set(credentialRegions)).toEqual(new Set(["paragraph-0", "paragraph-1"]));
  });
});
