import { decodeCaesar, decodeVigenere, POLYBIUS_SQUARE } from "../cipher";
import type { CipherScenario as CipherScenarioType } from "../types/scenario";

type Props = {
  scenario: CipherScenarioType;
  shift: number;
  wordIndex: number;
  draft: string;
  keyword: string;
  interactive: boolean;
  onShiftChange: (shift: number) => void;
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onKeyword: (keyword: string) => void;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function CipherScenario(props: Props) {
  const { scenario, shift, wordIndex, draft, keyword, interactive } = props;
  const { content } = scenario;
  const cipherWords = content.ciphertext.split(" ");
  const plaintextWords = content.plaintext.split(" ");
  const currentCipherWord = cipherWords[wordIndex] ?? "";
  const targetLength = plaintextWords[wordIndex]?.length ?? 0;
  let preview = draft || "_";

  if (content.cipherType === "caesar") preview = decodeCaesar(currentCipherWord, shift);
  if (content.cipherType === "vigenere") {
    preview = keyword ? decodeVigenere(content.ciphertext, keyword).split(" ")[wordIndex] ?? "_" : "Choose a keyword";
  }

  const letterKeyboard = (
    <div className="letter-keypad" role="group" aria-label="QWERTY letter keyboard">
      {keyboardRows.map((row) => <div className="letter-keypad-row" key={row}>
        {[...row].map((letter) => <button key={letter} type="button" disabled={!interactive || draft.length >= targetLength} onClick={() => props.onLetter(letter)}>{letter}</button>)}
      </div>)}
    </div>
  );

  return (
    <article className="cipher-card" aria-label={`${content.cipherType} cipher decoder`}>
      <div className="simulation-label">Fictional local puzzle · no information is entered or sent</div>
      <div className="cipher-body">
        <section aria-labelledby="ciphertext-title">
          <h2 id="ciphertext-title">Encrypted word</h2>
          <code className={`cipher-text ${content.cipherType === "polybius" ? "coordinate-text" : ""}`}>{currentCipherWord}</code>
          <p className="word-progress">Word {wordIndex + 1} of {cipherWords.length}</p>
        </section>

        {content.cipherType === "caesar" && <section aria-labelledby="cipher-tool-title">
          <h2 id="cipher-tool-title">Rotate the alphabet backwards</h2>
          <div className="shift-controls">
            <button type="button" disabled={!interactive} onClick={() => props.onShiftChange(shift - 1)} aria-label="Previous shift">−</button>
            <div className="shift-value"><strong>{shift}</strong><span>letter shift</span></div>
            <button type="button" disabled={!interactive} onClick={() => props.onShiftChange(shift + 1)} aria-label="Next shift">+</button>
          </div>
        </section>}

        {content.cipherType === "atbash" && <section aria-labelledby="cipher-tool-title">
          <h2 id="cipher-tool-title">Use the mirrored alphabet</h2>
          <div className="alphabet-guide" aria-label="Atbash alphabet guide"><code>{alphabet}</code><code>{[...alphabet].reverse().join("")}</code></div>
          {letterKeyboard}
          <button className="cipher-backspace" type="button" disabled={!interactive || !draft} onClick={props.onBackspace}>Remove last letter</button>
        </section>}

        {content.cipherType === "polybius" && <section aria-labelledby="cipher-tool-title">
          <h2 id="cipher-tool-title">Tap each coordinate in the square</h2>
          <div className="polybius-grid" aria-label="Polybius square">
            {[...POLYBIUS_SQUARE].map((letter, index) => {
              const coordinate = `${Math.floor(index / 5) + 1}${index % 5 + 1}`;
              return <button key={coordinate} type="button" disabled={!interactive || draft.length >= targetLength} onClick={() => props.onLetter(letter)} aria-label={`${coordinate}, ${letter}`}><small>{coordinate}</small><strong>{letter === "I" ? "I/J" : letter}</strong></button>;
            })}
          </div>
          <button className="cipher-backspace" type="button" disabled={!interactive || !draft} onClick={props.onBackspace}>Remove last letter</button>
        </section>}

        {content.cipherType === "vigenere" && <section aria-labelledby="cipher-tool-title">
          <h2 id="cipher-tool-title">Test a repeating keyword</h2>
          <div className="keyword-options">{content.keywordOptions.map((option) => <button key={option} type="button" disabled={!interactive} aria-pressed={keyword === option} onClick={() => props.onKeyword(option)}>{option}</button>)}</div>
        </section>}

        <section aria-labelledby="decoded-title">
          <h2 id="decoded-title">Decoded word preview</h2>
          <output className="cipher-text decoded-text" aria-live="polite">{preview}</output>
        </section>
        <section aria-labelledby="message-progress-title">
          <h2 id="message-progress-title">Recovered message</h2>
          <p className="cipher-text recovered-text">{plaintextWords.map((word, index) => index < wordIndex ? word : "___").join(" ")}</p>
        </section>
      </div>
    </article>
  );
}
