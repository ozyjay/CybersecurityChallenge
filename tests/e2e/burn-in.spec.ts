import { expect, test } from "@playwright/test";
import { guardLocalRuntime } from "./runtimeGuard";

const configuredMinutes = Number(process.env.BURN_IN_MINUTES ?? "0");

test("@burn-in repeated visitor and replay cycles remain stable", async ({ page }) => {
  test.skip(!Number.isFinite(configuredMinutes) || configuredMinutes <= 0, "Set BURN_IN_MINUTES to run the burn-in.");
  test.setTimeout((configuredMinutes + 2) * 60_000);
  const runtime = guardLocalRuntime(page);
  const finishAt = Date.now() + configuredMinutes * 60_000;
  let cycles = 0;

  await page.goto("/staff?seed=2026");
  while (Date.now() < finishAt) {
    await page.getByRole("button", { name: /tap to begin/i }).click();
    await page.getByRole("button", { name: /urgent account warning/i }).click();
    await page.getByRole("button", { name: /sender name and address/i }).click();
    await page.getByRole("button", { name: /make my decision/i }).click();
    await page.getByRole("button", { name: /report or escalate/i }).click();
    await page.getByRole("button", { name: /see my result/i }).click();
    await page.getByRole("button", { name: /reset for next visitor/i }).click();
    cycles += 1;

    if (cycles % 10 === 0) {
      await page.keyboard.press("Control+Alt+S");
      await page.getByRole("button", { name: /start prepared replay/i }).click();
      await expect(page.getByText(/automated local example/i)).toBeVisible();
      await page.mouse.click(2, 2);
      await expect(page.getByRole("button", { name: /tap to begin/i })).toBeVisible();
    }
  }

  expect(cycles).toBeGreaterThan(0);
  runtime.assertClean();
  console.log(`Burn-in completed ${cycles} visitor cycles over ${configuredMinutes} minute(s).`);
});
