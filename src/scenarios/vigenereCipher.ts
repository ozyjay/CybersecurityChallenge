import type { ScenarioFamily } from "../types/scenario";

export const vigenereCipher = {
  id: "vigenere-keyword-cipher",
  activity: "cipher",
  title: "Test the repeating keyword",
  category: "cipher",
  difficulty: "intermediate",
  introduction: "Test the reviewed keywords and find the one that reveals a readable message.",
  content: {
    kind: "cipher",
    cipherType: "vigenere",
    ciphertext: "FVQMTHVE SXMJ DZXOKF ZXDVBBXR GBBMSIOA",
    plaintext: "REPEATED KEYS CREATE REPEATED PATTERNS",
    keyword: "ORBIT",
    keywordOptions: ["ORBIT", "SOLAR", "COMET"],
    hints: ["The keyword has five letters.", "The correct keyword is ORBIT."],
    revealExplanation: "Vigenère changes its letter shift using a keyword, but a short repeated keyword creates patterns that analysts can test and compare."
  },
  takeaway: "A changing shift is stronger than one fixed shift, but short repeated keys remain vulnerable.",
  careerConnection: "Modern cryptographers analyse key reuse and design systems with large keys, safe modes, and rigorous review.",
  variants: [{
    id: "keywords-repeat",
    content: {
      kind: "cipher",
      cipherType: "vigenere",
      ciphertext: "VIKKBCHE QULRSS YPXFSED FGH FEMXZ EPTQOG",
      plaintext: "KEYWORDS CHANGE LETTERS BUT STILL REPEAT",
      keyword: "LEMON",
      keywordOptions: ["LEMON", "CLOUD", "RIVER"],
      hints: ["The keyword has five letters.", "The correct keyword is LEMON."],
      revealExplanation: "The repeated keyword changes each letter by a repeating sequence. That repetition gives cryptanalysts structure to investigate."
    }
  }]
} satisfies ScenarioFamily;
