/** @vitest-environment node */
import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import { assertPortAvailable, portConflictMessage, validateDevelopmentPort } from "./port-policy.mjs";

function occupiedServer() {
  const server = new EventEmitter();
  server.listen = () => queueMicrotask(() => server.emit("error", Object.assign(new Error("busy"), { code: "EADDRINUSE" })));
  server.close = () => undefined;
  return server;
}

describe("development port policy", () => {
  it("parses the documented default and valid configured values", () => {
    expect(validateDevelopmentPort(undefined)).toBe(4173);
    expect(validateDevelopmentPort("5173")).toBe(5173);
  });

  it.each(["not-a-port", "80", "65536", "3600", "8600", "8610", "8699"])("rejects invalid or reserved port %s", (value) => {
    expect(() => validateDevelopmentPort(value)).toThrow(/APP_PORT/);
  });

  it("reports occupied ports clearly", async () => {
    await expect(assertPortAvailable("127.0.0.1", 4173, occupiedServer)).rejects.toThrow("Cannot start the demo on 127.0.0.1:4173: the port is already occupied.");
    expect(portConflictMessage("127.0.0.1", 4173, { message: "permission denied" })).toContain("permission denied");
  });
});
