import { runBuild, runLocalTool } from "./local-tools.mjs";
import { assertManagedChromiumAvailable } from "./playwright-browser.mjs";

const minutes = Number(process.env.BURN_IN_MINUTES ?? "10");
if (!Number.isFinite(minutes) || minutes <= 0) {
  console.error("BURN_IN_MINUTES must be a positive number.");
  process.exit(1);
}

try {
  await runBuild();
  await assertManagedChromiumAvailable();
  await runLocalTool("playwright", ["test", "--grep", "@burn-in"], { ...process.env, BURN_IN_MINUTES: String(minutes) });
} catch (error) {
  console.error(error instanceof Error ? error.message : "Burn-in verification failed.");
  process.exit(1);
}
