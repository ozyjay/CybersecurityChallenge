import { describe, expect, it } from "vitest";
import { demoSeedFromSearch } from "./config";

describe("rehearsal seed configuration", () => {
  it("accepts reproducible unsigned integer seeds", () => {
    expect(demoSeedFromSearch("?seed=42")).toBe(42);
    expect(demoSeedFromSearch("?mode=replay&seed=4294967295")).toBe(4294967295);
  });

  it.each(["", "?seed=-1", "?seed=1.5", "?seed=word", "?seed=4294967296"])("ignores invalid search value %s", (search) => {
    expect(demoSeedFromSearch(search)).toBeUndefined();
  });
});
