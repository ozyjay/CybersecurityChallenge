import { expect, test } from "@playwright/test";
import { guardLocalRuntime } from "./runtimeGuard";

test("staff controls filter cases and directly start a prepared scenario", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=9");
  await page.keyboard.press("Control+Alt+s");
  await expect(page.getByRole("dialog", { name: /staff controls/i })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /sound cues/i })).not.toBeChecked();
  await page.getByLabel(/difficulty/i).selectOption("starter");
  const preparedScenario = page.getByRole("combobox", { name: /prepared scenario/i });
  const wifiValue = await preparedScenario.locator("option", { hasText: /premium campus wi-fi poster/i }).getAttribute("value");
  await preparedScenario.selectOption(wifiValue!);
  await page.getByRole("button", { name: /start selected case/i }).click();
  await expect(page.getByRole("heading", { name: /premium campus wi-fi poster/i })).toBeVisible();
  runtime.assertClean();
});

test("prepared replay advances, is labelled, and stops on visitor input", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=21");
  await page.keyboard.press("Control+Alt+S");
  const preparedScenario = page.getByRole("combobox", { name: /prepared scenario/i });
  const warningValue = await preparedScenario.locator("option", { hasText: /urgent account warning/i }).getAttribute("value");
  await preparedScenario.selectOption(warningValue!);
  await page.getByRole("button", { name: /start prepared replay/i }).click();
  await expect(page.getByText(/automated local example/i)).toBeVisible();
  await expect(page.locator(".clue-counter strong")).toHaveText("3", { timeout: 4_000 });
  await expect(page.getByRole("heading", { name: /what the scenario was hiding/i })).toBeVisible({ timeout: 6_000 });
  await page.mouse.click(2, 2);
  await expect(page.getByRole("button", { name: /tap to begin/i })).toBeVisible();
  await expect(page.getByText(/automated local example/i)).toBeHidden();
  runtime.assertClean();
});

test("repeated reset and replay interruption remains clean", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=100");
  for (let cycle = 0; cycle < 8; cycle += 1) {
    await page.getByRole("button", { name: /tap to begin/i }).click();
    await page.getByRole("button", { name: /urgent account warning/i }).click();
    await page.getByRole("button", { name: /reset for next visitor/i }).click();
  }
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.keyboard.press("Control+Alt+S");
    await page.getByRole("button", { name: /start prepared replay/i }).click();
    await expect(page.getByText(/automated local example/i)).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(page.getByRole("button", { name: /tap to begin/i })).toBeVisible();
  }
  runtime.assertClean();
});
