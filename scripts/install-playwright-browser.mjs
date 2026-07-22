import { runLocalTool } from "./local-tools.mjs";

try {
  await runLocalTool("playwright", ["install", "chromium"]);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Playwright browser installation failed.");
  process.exit(1);
}
