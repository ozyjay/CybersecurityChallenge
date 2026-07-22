import { decodeCaesar } from "../cipher";
import type { CipherScenario as CipherScenarioType } from "../types/scenario";

type Props = {
  scenario: CipherScenarioType;
  shift: number;
  interactive: boolean;
  onShiftChange: (shift: number) => void;
};

export function CipherScenario({ scenario, shift, interactive, onShiftChange }: Props) {
  const decoded = decodeCaesar(scenario.content.ciphertext, shift);
  return (
    <article className="cipher-card" aria-label="Caesar cipher decoder">
      <div className="simulation-label">Fictional local puzzle · no information is entered or sent</div>
      <div className="cipher-body">
        <section aria-labelledby="ciphertext-title">
          <h2 id="ciphertext-title">Encrypted message</h2>
          <code className="cipher-text">{scenario.content.ciphertext}</code>
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
          <h2 id="decoded-title">Decoded preview</h2>
          <output className="cipher-text decoded-text" aria-live="polite">{decoded}</output>
        </section>
      </div>
    </article>
  );
}
