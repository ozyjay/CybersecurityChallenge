export function demoSeedFromSearch(search: string): number | undefined {
  const value = new URLSearchParams(search).get("seed");
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const seed = Number(value);
  return Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff ? seed : undefined;
}
