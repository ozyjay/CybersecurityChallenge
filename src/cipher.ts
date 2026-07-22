export function decodeCaesar(ciphertext: string, shift: number): string {
  if (!Number.isInteger(shift) || shift < 0 || shift > 25) {
    throw new RangeError("Caesar shift must be an integer from 0 to 25.");
  }

  return [...ciphertext].map((character) => {
    const code = character.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(65 + ((code - 65 - shift + 26) % 26));
    if (code >= 97 && code <= 122) return String.fromCharCode(97 + ((code - 97 - shift + 26) % 26));
    return character;
  }).join("");
}
