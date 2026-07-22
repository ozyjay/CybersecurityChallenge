// @vitest-environment node

import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { localToolPath, projectRoot } from "./local-tools.mjs";

describe("project-local tool resolution", () => {
  it.each(["playwright", "tsc", "vite", "vitest"])("resolves installed %s without a global shim", (tool) => {
    const path = localToolPath(tool);
    expect(path.startsWith(projectRoot)).toBe(true);
    expect(existsSync(path)).toBe(true);
  });

  it("rejects unknown tool names", () => {
    expect(() => localToolPath("snap-tool")).toThrow(/unknown local tool/i);
  });
});
