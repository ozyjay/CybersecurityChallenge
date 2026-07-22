import { accountWarning } from "./accountWarning";
import { expectedNotification } from "./expectedNotification";
import { internshipOffer } from "./internshipOffer";
import { allVariants, buildScenarioDeck as createDeck } from "./randomise";
import { sharedDocumentLogin } from "./sharedDocumentLogin";
import { secretCipher } from "./secretCipher";
import { assertValidScenarios } from "./validate";
import { wifiQrPoster } from "./wifiQrPoster";

export const scenarioFamilies = [accountWarning, wifiQrPoster, internshipOffer, sharedDocumentLogin, expectedNotification, secretCipher];
export const scenarios = allVariants(scenarioFamilies);

assertValidScenarios(scenarios);

export function buildScenarioDeck(seed: number, excludedScenarioIds: readonly string[] = []) {
  return createDeck(scenarioFamilies, seed, excludedScenarioIds);
}
