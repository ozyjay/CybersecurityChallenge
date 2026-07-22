import { runLocalTool } from "./local-tools.mjs";

try {
  await runLocalTool("vite", ["preview", "--strictPort"]);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Production preview failed.");
  process.exit(1);
}
