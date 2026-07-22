import { loadEnv } from "vite";
import { runLocalTool } from "./local-tools.mjs";
import { assertPortAvailable, validateDevelopmentPort } from "./port-policy.mjs";

const env = loadEnv(process.env.DEMO_MODE || "development", process.cwd(), "");
const host = env.APP_HOST || "127.0.0.1";

try {
  const port = validateDevelopmentPort(env.APP_PORT);
  await assertPortAvailable(host, port);
  await runLocalTool("vite", ["--host", host, "--port", String(port), "--strictPort"]);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Cannot start the demo because the host or port configuration is invalid.");
  process.exit(1);
}
