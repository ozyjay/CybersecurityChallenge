import { expect, test } from "@playwright/test";
import { guardLocalRuntime } from "./runtimeGuard";

test.use({ hasTouch: true });

test("loaded production build completes a case after browser network is disabled", async ({ page, context }) => {
  const runtime = guardLocalRuntime(page);
  await page.goto("/?seed=42");
  await context.setOffline(true);
  await page.getByRole("button", { name: /tap to begin/i }).click();
  await page.getByRole("button", { name: /urgent account warning/i }).click();
  await page.getByRole("button", { name: /make my decision/i }).click();
  await page.getByRole("button", { name: /report or escalate/i }).click();
  await expect(page.getByRole("heading", { name: /what the scenario was hiding/i })).toBeVisible();
  runtime.assertClean();
});

test("compact touch viewport keeps primary controls available", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/?seed=42");
  await page.getByRole("button", { name: /tap to begin/i }).click();
  const choices = page.getByRole("button", { name: /play this case/i });
  await expect(choices).toHaveCount(6);
  const box = await choices.first().boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  await page.getByRole("button", { name: /urgent account warning/i }).tap();
  await expect(page.getByRole("button", { name: /make my decision/i })).toBeVisible();
  runtime.assertClean();
});

test("reduced-motion preference removes button transitions", async ({ page }) => {
  const runtime = guardLocalRuntime(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?seed=42");
  await page.getByRole("button", { name: /tap to begin/i }).click();
  const duration = await page.getByRole("button", { name: /play this case/i }).first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration).toBe("0s");
  runtime.assertClean();
});
