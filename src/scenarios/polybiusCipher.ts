import type { ScenarioFamily } from "../types/scenario";

export const polybiusCipher = {
  id: "polybius-number-square",
  activity: "cipher",
  title: "Crack the number square",
  category: "cipher",
  difficulty: "starter",
  introduction: "Use each row-and-column pair to recover letters from a Polybius square.",
  content: {
    kind: "cipher",
    cipherType: "polybius",
    ciphertext: "31-34-34-25 45-35 15-11-13-23 35-11-24-42 44-34 21-24-33-14 44-23-15 31-15-44-44-15-42-43",
    plaintext: "LOOK UP EACH PAIR TO FIND THE LETTERS",
    hints: ["The first digit is the row and the second digit is the column.", "The first pair, 31, points to L."],
    revealExplanation: "A Polybius square turns letters into visible coordinates. Anyone with the same square can reverse every pair, and word boundaries still reveal structure."
  },
  takeaway: "Coordinates are a useful representation, but a known square does not provide secrecy.",
  careerConnection: "Security engineers distinguish reversible representations from encryption that is designed to resist attackers.",
  variants: [{
    id: "coordinates-to-letters",
    content: {
      kind: "cipher",
      cipherType: "polybius",
      ciphertext: "22-42-24-14-43 44-45-42-33 13-34-34-42-14-24-33-11-44-15-43 24-33-44-34 31-15-44-44-15-42-43",
      plaintext: "GRIDS TURN COORDINATES INTO LETTERS",
      hints: ["Find each numbered cell in order from left to right.", "The first pair, 22, points to G."],
      revealExplanation: "The numbered grid is a lookup table rather than a secret. Repeated coordinate pairs also expose repeated letters."
    }
  }]
} satisfies ScenarioFamily;
