import { spawn } from "node:child_process";

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}.`)));
  });
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

try {
  await run(npm, ["run", "build"]);
  await run(npx, ["playwright", "test", ...process.argv.slice(2)]);
} catch (error) {
  console.error(error instanceof Error ? error.message : "End-to-end verification failed.");
  process.exit(1);
}
