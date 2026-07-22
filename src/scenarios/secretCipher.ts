import type { ScenarioFamily } from "../types/scenario";

export const secretCipher = {
  id: "secret-caesar-cipher",
  activity: "cipher",
  title: "Decode the secret message",
  category: "cipher",
  difficulty: "starter",
  introduction: "Rotate the alphabet until this historical cipher reveals a readable message.",
  content: {
    kind: "cipher",
    ciphertext: "ROG FLSKHUV KLGH WHAW EXW GR QRW NHHS LW VDIH",
    plaintext: "OLD CIPHERS HIDE TEXT BUT DO NOT KEEP IT SAFE",
    shift: 3,
    hints: ["The decoded message starts with OLD.", "Move every letter 3 places backwards."],
    revealExplanation: "A Caesar cipher repeats the same small shift for every letter. Trying the limited possible shifts quickly exposes the original message."
  },
  takeaway: "Historical ciphers can obscure words, but sensitive information needs modern, tested encryption.",
  careerConnection: "Cryptographers design and analyse encryption methods that protect information against realistic attacks.",
  variants: [
    {
      id: "modern-encryption",
      content: {
        kind: "cipher",
        ciphertext: "TVKLYU LUJYFWAPVU BZLZ ALZALK TLAOVKZ HUK ZAYVUN RLFZ",
        plaintext: "MODERN ENCRYPTION USES TESTED METHODS AND STRONG KEYS",
        shift: 7,
        hints: ["The decoded message starts with MODERN.", "Move every letter 7 places backwards."],
        revealExplanation: "A Caesar cipher has very few possible shifts, so an analyst can test all of them. Modern encryption uses thoroughly reviewed algorithms and much larger keys."
      }
    }
  ]
} satisfies ScenarioFamily;
