import type { Scenario, ScenarioFamily } from "../types/scenario";

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function materialise(family: ScenarioFamily, variantIndex = -1): Scenario {
  if (family.activity === "cipher") {
    const { variants: _variants, id: familyId, ...base } = family;
    const cipherVariant = variantIndex >= 0 ? family.variants[variantIndex] : undefined;
    const variantId = cipherVariant?.id ?? "original";
    return {
      ...base,
      id: `${familyId}:${variantId}`,
      familyId,
      variantId,
      content: cipherVariant?.content ?? family.content,
      takeaway: cipherVariant?.takeaway ?? family.takeaway,
      careerConnection: cipherVariant?.careerConnection ?? family.careerConnection
    };
  }
  const { variants: _variants, id: familyId, ...base } = family;
  const investigationVariant = variantIndex >= 0 ? family.variants[variantIndex] : undefined;
  const variantId = investigationVariant?.id ?? "original";
  return {
    ...base,
    id: `${familyId}:${variantId}`,
    familyId,
    variantId,
    content: investigationVariant?.content ?? family.content,
    clues: investigationVariant?.clues ?? family.clues,
    decoys: investigationVariant?.decoys ?? family.decoys,
    takeaway: investigationVariant?.takeaway ?? family.takeaway,
    careerConnection: investigationVariant?.careerConnection ?? family.careerConnection
  };
}

export function allVariants(families: readonly ScenarioFamily[]): Scenario[] {
  return families.flatMap((family) => [materialise(family), ...family.variants.map((_, index) => materialise(family, index))]);
}

export function buildScenarioDeck(families: readonly ScenarioFamily[], seed: number, excludedScenarioIds: readonly string[] = []): Scenario[] {
  const random = seededRandom(seed);
  const excluded = new Set(excludedScenarioIds);
  const deck = families.map((family) => {
    const allChoices = [materialise(family), ...family.variants.map((_, index) => materialise(family, index))];
    const availableChoices = allChoices.filter((scenario) => !excluded.has(scenario.id));
    const choices = availableChoices.length > 0 ? availableChoices : allChoices;
    return choices[Math.floor(random() * choices.length)];
  });

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

export function createRandomSeed(): number {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0];
}
