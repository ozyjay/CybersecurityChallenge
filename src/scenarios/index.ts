import { accountWarning } from "./accountWarning";
import { internshipOffer } from "./internshipOffer";
import { sharedDocumentLogin } from "./sharedDocumentLogin";
import { wifiQrPoster } from "./wifiQrPoster";
import { assertValidScenarios } from "./validate";

export const scenarios = [accountWarning, wifiQrPoster, internshipOffer, sharedDocumentLogin];

assertValidScenarios(scenarios);

export function scenarioById(id: string) {
  return scenarios.find((scenario) => scenario.id === id);
}
