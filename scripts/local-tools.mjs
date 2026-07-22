import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));

const toolPaths = {
  playwright: "node_modules/@playwright/test/cli.js",
  tsc: "node_modules/typescript/bin/tsc",
  vite: "node_modules/vite/bin/vite.js",
  vitest: "node_modules/vitest/vitest.mjs"
};

export function localToolPath(tool) {
  const relativePath = toolPaths[tool];
  if (!relativePath) throw new Error(`Unknown local tool: ${tool}`);
  return fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
}

export async function runLocalTool(tool, args = [], env = process.env) {
  const entryPoint = localToolPath(tool);
  try {
    await access(entryPoint);
  } catch {
    throw new Error(`Local ${tool} is unavailable. Run npm install in ${projectRoot} before continuing.`);
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entryPoint, ...args], { cwd: projectRoot, stdio: "inherit", env });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${tool} exited ${signal ? `after signal ${signal}` : `with code ${code ?? "unknown"}`}.`));
    });
  });
}

export async function runBuild(env = process.env) {
  await runLocalTool("tsc", ["-b"], env);
  await runLocalTool("vite", ["build"], env);
}
