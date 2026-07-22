import { describe, expect, it } from "vitest";
import { decodeAtbash, decodeCaesar, decodePolybius, decodeVigenere } from "./cipher";

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

describe("additional historical ciphers", () => {
  it("decodes a mirrored Atbash alphabet", () => {
    expect(decodeAtbash("ZGYZHS!" )).toBe("ATBASH!");
  });

  it("decodes Polybius row and column pairs", () => {
    expect(decodePolybius("31-34-34-25 45-35")).toBe("LOOK UP");
    expect(() => decodePolybius("66")).toThrow(/row and column/i);
  });

  it("decodes Vigenère while carrying the keyword across spaces", () => {
    expect(decodeVigenere("FVQMTHVE SXMJ", "ORBIT")).toBe("REPEATED KEYS");
    expect(() => decodeVigenere("ABC", "bad key")).toThrow(/uppercase/i);
  });
});
