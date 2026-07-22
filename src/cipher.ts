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

export const POLYBIUS_SQUARE = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

export function decodeAtbash(ciphertext: string): string {
  return [...ciphertext].map((character) => {
    const code = character.toUpperCase().charCodeAt(0);
    return code >= 65 && code <= 90 ? String.fromCharCode(155 - code) : character;
  }).join("");
}

export function decodePolybius(ciphertext: string): string {
  return ciphertext.split(" ").map((word) => word.split("-").map((pair) => {
    if (!/^[1-5][1-5]$/.test(pair)) throw new RangeError("Polybius coordinates must use row and column values from 1 to 5.");
    const index = (Number(pair[0]) - 1) * 5 + Number(pair[1]) - 1;
    return POLYBIUS_SQUARE[index];
  }).join("")).join(" ");
}

export function decodeVigenere(ciphertext: string, keyword: string): string {
  if (!/^[A-Z]+$/.test(keyword)) throw new RangeError("Vigenère keyword must contain uppercase A–Z letters only.");
  let keyIndex = 0;
  return [...ciphertext].map((character) => {
    const code = character.toUpperCase().charCodeAt(0);
    if (code < 65 || code > 90) return character;
    const shift = keyword.charCodeAt(keyIndex++ % keyword.length) - 65;
    return String.fromCharCode(65 + ((code - 65 - shift + 26) % 26));
  }).join("");
}
