import type { Scenario, ScenarioFamily, ScenarioVariant } from "../types/scenario";

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

function materialise(family: ScenarioFamily, variant?: ScenarioVariant): Scenario {
  const { variants: _variants, id: familyId, ...base } = family;
  const variantId = variant?.id ?? "original";
  return {
    ...base,
    id: `${familyId}:${variantId}`,
    familyId,
    variantId,
    content: variant?.content ?? base.content,
    clues: variant?.clues ?? base.clues,
    decoys: variant?.decoys ?? base.decoys,
    takeaway: variant?.takeaway ?? base.takeaway,
    careerConnection: variant?.careerConnection ?? base.careerConnection
  };
}

export function allVariants(families: readonly ScenarioFamily[]): Scenario[] {
  return families.flatMap((family) => [materialise(family), ...family.variants.map((variant) => materialise(family, variant))]);
}

export function buildScenarioDeck(families: readonly ScenarioFamily[], seed: number): Scenario[] {
  const random = seededRandom(seed);
  const deck = families.map((family) => {
    const choices: Array<ScenarioVariant | undefined> = [undefined, ...family.variants];
    return materialise(family, choices[Math.floor(random() * choices.length)]);
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
