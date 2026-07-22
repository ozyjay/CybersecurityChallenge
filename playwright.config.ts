import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? "4174");
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npm run preview",
    url: baseURL,
    env: { APP_HOST: "127.0.0.1", APP_PORT: String(port), DEMO_MODE: "development" },
    reuseExistingServer: false,
    timeout: 30_000
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }]
});
