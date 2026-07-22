import { spawn } from "node:child_process";

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}.`)));
  });
}

const minutes = Number(process.env.BURN_IN_MINUTES ?? "60");
if (!Number.isFinite(minutes) || minutes <= 0) {
  console.error("BURN_IN_MINUTES must be a positive number.");
  process.exit(1);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

try {
  await run(npm, ["run", "build"]);
  await run(npx, ["playwright", "test", "--grep", "@burn-in"], { ...process.env, BURN_IN_MINUTES: String(minutes) });
} catch (error) {
  console.error(error instanceof Error ? error.message : "Burn-in verification failed.");
  process.exit(1);
}
