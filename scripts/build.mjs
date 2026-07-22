import { runBuild } from "./local-tools.mjs";

try {
  await runBuild();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Production build failed.");
  process.exit(1);
}
