import { expect, test } from "@playwright/test";
import { guardLocalRuntime } from "./runtimeGuard";

test("visitor completes a case and receives an alternate variant", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=42");
  await expect(page.getByRole("heading", { name: /can you spot the warning signs/i })).toBeVisible();
  await page.getByRole("button", { name: /tap to begin/i }).click();
  await expect(page.getByRole("button", { name: /play this case/i })).toHaveCount(9);

  const caseButton = page.getByRole("button", { name: /urgent account warning/i });
  const firstVariant = await caseButton.getAttribute("data-scenario-id");
  await caseButton.click();
  await page.getByRole("button", { name: /sender name and address/i }).click();
  await page.getByRole("button", { name: /make my decision/i }).click();
  await page.getByRole("button", { name: /report or escalate/i }).click();
  await expect(page.getByRole("heading", { name: /what the scenario was hiding/i })).toBeVisible();
  await page.getByRole("button", { name: /see my result/i }).click();
  await expect(page.getByText(/out of 80 points/i)).toBeVisible();
  await page.getByRole("button", { name: /choose the next case/i }).click();
  await expect(page.getByRole("button", { name: /urgent account warning/i })).not.toHaveAttribute("data-scenario-id", firstVariant ?? "");
  runtime.assertClean();
});

test("visitor decodes a local cipher without network activity", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=42");
  await page.getByRole("button", { name: /tap to begin/i }).click();
  const cipherCase = page.getByRole("button", { name: /decode the secret message/i });
  const variantId = await cipherCase.getAttribute("data-scenario-id");
  const shift = variantId?.endsWith(":modern-encryption") ? 7 : 3;
  await cipherCase.click();
  const wordCount = await page.locator(".word-progress").textContent().then((text) => Number(text?.match(/of (\d+)/)?.[1]));
  for (let word = 0; word < wordCount; word += 1) {
    if (word > 0) await expect(page.locator(".shift-value strong")).toHaveText("0");
    for (let step = 0; step < shift; step += 1) await page.getByRole("button", { name: /next shift/i }).click();
    await page.getByRole("button", { name: /lock in word/i }).click();
  }
  await expect(page.getByRole("heading", { name: /message decoded/i })).toBeVisible();
  await page.getByRole("button", { name: /see my result/i }).click();
  await expect(page.getByText(/out of 100 points/i)).toBeVisible();
  runtime.assertClean();
});

test("cipher families provide method-specific controls", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=42");

  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.getByRole("button", { name: /mirror the alphabet/i }).click();
  const atbashKeyboard = page.getByRole("group", { name: /qwerty letter keyboard/i });
  await expect(atbashKeyboard.getByRole("button")).toHaveText(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"]);
  await page.getByRole("button", { name: /reset for next visitor/i }).click();

  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.getByRole("button", { name: /crack the number square/i }).click();
  await expect(page.getByLabel(/polybius cipher decoder/i).getByRole("button", { name: /11, A/i })).toBeVisible();
  await page.getByRole("button", { name: /reset for next visitor/i }).click();

  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.getByRole("button", { name: /test the repeating keyword/i }).click();
  await expect(page.getByLabel(/vigenere cipher decoder/i).getByRole("button", { pressed: false })).toHaveCount(3);
  runtime.assertClean();
});

test("keyboard-only visitor navigation reaches scenario evidence", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=42");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /can you spot the scam/i })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /^staff$/i })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /tap to begin/i })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /urgent account warning/i }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /sender name and address/i }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: /sender name and address/i })).toHaveAttribute("aria-pressed", "true");
  runtime.assertClean();
});

test("next-visitor reset returns to attract and clears selections", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=17");
  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.getByRole("button", { name: /premium campus wi-fi poster/i }).click();
  await page.getByRole("button", { name: /unofficial branding/i }).click();
  await page.getByRole("button", { name: /reset for next visitor/i }).click();
  await expect(page.getByRole("button", { name: /tap to begin/i })).toBeVisible();
  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.getByRole("button", { name: /premium campus wi-fi poster/i }).click();
  await expect(page.locator(".clue-counter strong")).toHaveText("0");
  runtime.assertClean();
});
