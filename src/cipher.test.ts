import { describe, expect, it } from "vitest";
import { decodeCaesar } from "./cipher";

describe("Caesar cipher", () => {
  it("decodes uppercase and lowercase letters with alphabet wrapping", () => {
    expect(decodeCaesar("ABC XYZ abc xyz", 3)).toBe("XYZ UVW xyz uvw");
  });

  it("preserves spaces, punctuation, and digits", () => {
    expect(decodeCaesar("KHOOR, 2026!", 3)).toBe("HELLO, 2026!");
  });

  it.each([-1, 1.5, 26])("rejects invalid shift %s", (shift) => {
    expect(() => decodeCaesar("ABC", shift)).toThrow(/integer from 0 to 25/i);
  });
});
