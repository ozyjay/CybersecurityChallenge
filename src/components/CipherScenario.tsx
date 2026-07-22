import { decodeCaesar } from "../cipher";
import type { CipherScenario as CipherScenarioType } from "../types/scenario";

type Props = {
  scenario: CipherScenarioType;
  shift: number;
  wordIndex: number;
  interactive: boolean;
  onShiftChange: (shift: number) => void;
};

export function CipherScenario({ scenario, shift, wordIndex, interactive, onShiftChange }: Props) {
  const cipherWords = scenario.content.ciphertext.split(" ");
  const plaintextWords = scenario.content.plaintext.split(" ");
  const currentCipherWord = cipherWords[wordIndex] ?? "";
  const decoded = decodeCaesar(currentCipherWord, shift);
  return (
    <article className="cipher-card" aria-label="Caesar cipher decoder">
      <div className="simulation-label">Fictional local puzzle · no information is entered or sent</div>
      <div className="cipher-body">
        <section aria-labelledby="ciphertext-title">
          <h2 id="ciphertext-title">Encrypted word</h2>
          <code className="cipher-text">{currentCipherWord}</code>
          <p className="word-progress">Word {wordIndex + 1} of {cipherWords.length}</p>
        </section>
        <section aria-labelledby="shift-title">
          <h2 id="shift-title">Rotate the alphabet backwards</h2>
          <div className="shift-controls">
            <button type="button" disabled={!interactive} onClick={() => onShiftChange(shift - 1)} aria-label="Previous shift">−</button>
            <div className="shift-value"><strong>{shift}</strong><span>letter shift</span></div>
            <button type="button" disabled={!interactive} onClick={() => onShiftChange(shift + 1)} aria-label="Next shift">+</button>
          </div>
        </section>
        <section aria-labelledby="decoded-title">
          <h2 id="decoded-title">Decoded word preview</h2>
          <output className="cipher-text decoded-text" aria-live="polite">{decoded}</output>
        </section>
        <section aria-labelledby="message-progress-title">
          <h2 id="message-progress-title">Recovered message</h2>
          <p className="cipher-text recovered-text">{plaintextWords.map((word, index) => index < wordIndex ? word : "___").join(" ")}</p>
        </section>
      </div>
    </article>
  );
}
