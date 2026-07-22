import { runLocalTool } from "./local-tools.mjs";

try {
  await runLocalTool("vitest", process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unit and component tests failed.");
  process.exit(1);
}
