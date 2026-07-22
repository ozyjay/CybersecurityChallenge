import type { ScenarioFamily } from "../types/scenario";

export const atbashCipher = {
  id: "atbash-mirror-cipher",
  activity: "cipher",
  title: "Mirror the alphabet",
  category: "cipher",
  difficulty: "starter",
  introduction: "Use the mirrored alphabet to rebuild this message one word at a time.",
  content: {
    kind: "cipher",
    cipherType: "atbash",
    ciphertext: "KZGGVIMH NZPV HRNKOV XRKSVIH KIVWRXGZYOV",
    plaintext: "PATTERNS MAKE SIMPLE CIPHERS PREDICTABLE",
    hints: ["A pairs with Z, B pairs with Y, and the pattern continues.", "The first decoded word is PATTERNS."],
    revealExplanation: "Atbash always mirrors the alphabet in exactly the same way. Once the mapping is known, every letter can be replaced without a secret key."
  },
  takeaway: "A fixed, public substitution can hide text at a glance but cannot keep it secret.",
  careerConnection: "Cryptanalysts study repeated mappings and patterns to understand how protected information can be recovered.",
  variants: [{
    id: "structure-remains",
    content: {
      kind: "cipher",
      cipherType: "atbash",
      ciphertext: "NRIILIVW ZOKSZYVGH SRWV OVGGVIH MLG HGIFXGFIV",
      plaintext: "MIRRORED ALPHABETS HIDE LETTERS NOT STRUCTURE",
      hints: ["Read the two alphabet rows as letter pairs.", "The first decoded word is MIRRORED."],
      revealExplanation: "Mirroring changes each letter, but word lengths and repeated patterns remain visible. The fixed mapping offers no modern security."
    }
  }]
} satisfies ScenarioFamily;
