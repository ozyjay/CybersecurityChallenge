import net from "node:net";
import { spawn } from "node:child_process";
import { loadEnv } from "vite";

const env = loadEnv(process.env.DEMO_MODE || "development", process.cwd(), "");
const host = env.APP_HOST || "127.0.0.1";
const port = Number(env.APP_PORT || "4173");
const blocked = port === 3600 || port === 8600 || (port >= 8610 && port <= 8699);

if (!Number.isInteger(port) || port < 1024 || port > 65535 || blocked) {
  console.error(blocked ? `APP_PORT ${port} is reserved for ModelDeck.` : "APP_PORT must be a whole number between 1024 and 65535.");
  process.exit(1);
}

const probe = net.createServer();
probe.once("error", (error) => {
  console.error(`Cannot start the demo on ${host}:${port}: ${error.code === "EADDRINUSE" ? "the port is already occupied" : error.message}.`);
  process.exit(1);
});
probe.once("listening", () => {
  probe.close(() => {
    const vite = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["vite", "--host", host, "--port", String(port), "--strictPort"], { stdio: "inherit", env: process.env });
    vite.once("exit", (code) => process.exit(code ?? 1));
  });
});
probe.listen(port, host);
