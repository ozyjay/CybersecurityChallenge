import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

const blockedPorts = new Set([3600, 8600, ...Array.from({ length: 90 }, (_, index) => 8610 + index)]);

function developmentPort(value: string | undefined): number {
  const port = Number(value ?? "4173");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("APP_PORT must be a whole number between 1024 and 65535.");
  }
  if (blockedPorts.has(port)) {
    throw new Error(`APP_PORT ${port} is reserved for ModelDeck and cannot be used.`);
  }
  return port;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.APP_HOST || "127.0.0.1";
  const port = developmentPort(env.APP_PORT);

  return {
    plugins: [react()],
    server: { host, port, strictPort: true },
    preview: { host, port, strictPort: true },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
      exclude: [...configDefaults.exclude, "tests/e2e/**"]
    }
  };
});
