import { describe, expect, it } from "vitest";
import { accountWarning } from "./accountWarning";
import { assertValidScenario, validateScenario } from "./validate";

describe("scenario validation", () => {
  it("accepts the curated fictional scenario", () => {
    expect(validateScenario(accountWarning)).toEqual([]);
  });

  it("rejects unsafe domains and executable markup", () => {
    const unsafe = { ...accountWarning, title: "Visit https://real.invalid now <script>alert(1)</script>" };
    expect(() => assertValidScenario(unsafe)).toThrow(/not allowlisted|markup/);
  });

  it("contains no password or personal-data input elements", () => {
    expect(JSON.stringify(accountWarning)).not.toMatch(/<input|type=["']password|name=["']email/i);
  });
});
