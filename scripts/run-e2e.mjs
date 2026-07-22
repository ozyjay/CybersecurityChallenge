import { runBuild, runLocalTool } from "./local-tools.mjs";
import { assertManagedChromiumAvailable } from "./playwright-browser.mjs";

try {
  await runBuild();
  await assertManagedChromiumAvailable();
  await runLocalTool("playwright", ["test", ...process.argv.slice(2)]);
} catch (error) {
  console.error(error instanceof Error ? error.message : "End-to-end verification failed.");
  process.exit(1);
}
