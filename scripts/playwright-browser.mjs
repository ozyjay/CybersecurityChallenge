import { access } from "node:fs/promises";
import { chromium } from "playwright";

export async function assertManagedChromiumAvailable() {
  const executable = chromium.executablePath();
  try {
    await access(executable);
  } catch {
    throw new Error("Playwright-managed Chromium is not installed. Run npm run install:browsers. Snap-packaged Chromium is intentionally not used because its confinement is unreliable for automated booth checks.");
  }
  return executable;
}
