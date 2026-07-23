import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ScenarioDisplay } from "./components/ScenarioDisplay";
import { StaffControls, type StaffSettings } from "./components/StaffControls";
import { useCountdown } from "./hooks/useCountdown";
import { usePreparedReplay } from "./hooks/usePreparedReplay";
import { buildScenarioDeck } from "./scenarios";
import { createRandomSeed } from "./scenarios/randomise";
import { gameReducer, initialGameState, resultLabel, scoreCipher, scoreGame } from "./state/game";
import type { Decision, ScenarioCategory } from "./types/scenario";

const decisionLabels: Record<Decision, string> = {
  safe: "Safe",
  suspicious: "Suspicious",
  escalate: "Report or escalate"
};

const categoryLabels: Record<ScenarioCategory, string> = {
  email: "Email",
  sms: "Direct message",
  qr: "QR poster",
  login: "Sign-in page",
  permissions: "Permission request",
  cipher: "Cipher puzzle"
};

const defaultStaffSettings: StaffSettings = {
  timerEnabled: true,
  relaxedMode: false,
  soundEnabled: false,
  difficulty: "all",
  replayLoop: true
};

async function playSoundCue(enabled: boolean) {
  if (!enabled || typeof AudioContext === "undefined") return;
  try {
    const context = new AudioContext();
    await context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.addEventListener("ended", () => void context.close());
  } catch (error) {
    console.warn("Optional sound cue could not be played.", error);
  }
}

type AppProps = {
  seed?: number;
  timerSeconds?: number;
  replayStepMilliseconds?: number;
};

export default function App({ seed, timerSeconds = 45, replayStepMilliseconds = 1400 }: AppProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffSettings, setStaffSettings] = useState(defaultStaffSettings);
  const [selectedStaffScenarioId, setSelectedStaffScenarioId] = useState("");
  const baseSeed = useRef(seed ?? createRandomSeed());
  const deck = useMemo(
    () => buildScenarioDeck(baseSeed.current + state.round, state.lastCompletedScenarioId ? [state.lastCompletedScenarioId] : []),
    [state.lastCompletedScenarioId, state.round]
  );
  const visibleDeck = staffSettings.difficulty === "all"
    ? deck
    : deck.filter((candidate) => candidate.difficulty === staffSettings.difficulty);
  const scenario = state.scenarioId ? deck.find((candidate) => candidate.id === state.scenarioId) : undefined;
  const score = scenario
    ? scenario.activity === "cipher"
      ? scoreCipher(state.cipherHintsUsed, state.cipherIncorrectAttempts)
      : scoreGame(scenario, state.selectedClueIds, state.decision)
    : null;
  const cipherWords = scenario?.activity === "cipher" ? scenario.content.plaintext.split(" ") : [];
  const cipherAttemptCorrect = scenario?.activity === "cipher" && (
    scenario.content.cipherType === "caesar"
      ? state.cipherShift === scenario.content.shift
      : scenario.content.cipherType === "vigenere"
        ? state.cipherKeyword === scenario.content.keyword
        : state.cipherDraft === cipherWords[state.cipherWordIndex]
  );
  const nextCipherKeyword = (() => {
    if (scenario?.activity !== "cipher" || scenario.content.cipherType !== "vigenere") return undefined;
    const { keyword, keywordOptions } = scenario.content;
    return keywordOptions.find((option) => option !== keyword);
  })();
  const cipherRevealLabel = scenario?.activity === "cipher"
    ? scenario.content.cipherType === "caesar"
      ? `Shift ${scenario.content.shift}`
      : scenario.content.cipherType === "vigenere"
        ? `Keyword ${scenario.content.keyword}`
        : scenario.content.cipherType === "atbash" ? "Mirrored alphabet" : "Number square"
    : "";
  const replay = usePreparedReplay({ state, deck, dispatch, loop: staffSettings.replayLoop, stepMilliseconds: replayStepMilliseconds });

  const handleTimerExpiry = useCallback(() => {
    void playSoundCue(staffSettings.soundEnabled);
    if (scenario?.activity !== "cipher") dispatch({ type: "OPEN_DECISION" });
  }, [scenario?.activity, staffSettings.soundEnabled]);
  const countdown = useCountdown({
    active: state.screen === "SCENARIO" && staffSettings.timerEnabled && !state.isReplay,
    durationSeconds: staffSettings.relaxedMode ? timerSeconds * 2 : timerSeconds,
    resetKey: `${state.round}:${state.scenarioId ?? "none"}`,
    onExpire: handleTimerExpiry
  });

  useEffect(() => {
    if (!deck.some((candidate) => candidate.id === selectedStaffScenarioId)) {
      setSelectedStaffScenarioId(deck[0]?.id ?? "");
    }
  }, [deck, selectedStaffScenarioId]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setStaffOpen((open) => !open);
      } else if (event.key === "Escape") {
        setStaffOpen(false);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (state.screen === "RESULT") void playSoundCue(staffSettings.soundEnabled);
  }, [staffSettings.soundEnabled, state.screen]);

  const resetButton = !["ATTRACT", "RESULT"].includes(state.screen) && (
    <button className="quiet-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Reset for next visitor</button>
  );

  const closeAnd = (action: () => void) => {
    setStaffOpen(false);
    action();
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#main" aria-label="Can You Spot the Scam? home">Can You Spot the Scam?</a>
        <div className="header-actions">
          {resetButton}
          <button className="staff-button" type="button" onClick={() => setStaffOpen((open) => !open)} aria-expanded={staffOpen}>Staff</button>
        </div>
      </header>

      {replay.running && <div className="replay-banner" role="status"><strong>Prepared demonstration</strong><span>Automated local example · press any key or tap anywhere to stop</span></div>}

      <main id="main" className="main-content">
        {state.screen === "ATTRACT" && (
          <section className="intro panel attract" aria-labelledby="attract-title">
            <span className="eyebrow">Cyber investigation challenge</span>
            <h1 id="attract-title">Can you spot the warning signs before time runs out?</h1>
            <p className="lead">Look for warning signs before you trust a message, link, or login page.</p>
            <button className="primary-button" type="button" onClick={() => dispatch({ type: "OPEN_CASES" })}>Tap to begin</button>
            <p className="privacy-note">This is a fictional local simulation. It does not collect passwords or personal information.</p>
          </section>
        )}

        {state.screen === "INTRO" && (
          <section className="intro scenario-intro" aria-labelledby="intro-title">
            <span className="eyebrow">Choose your investigation</span>
            <h1 id="intro-title">Which case will you inspect?</h1>
            <p className="lead">Investigate a suspicious artefact or decode a prepared cipher puzzle.</p>
            <div className="scenario-picker" aria-label="Choose a scenario">
              {visibleDeck.map((option, index) => (
                <button className="scenario-choice" type="button" key={option.id} data-scenario-id={option.id} onClick={() => dispatch({ type: "BEGIN", scenarioId: option.id })}>
                  <span className="case-number">Case {String(index + 1).padStart(2, "0")}</span>
                  <strong>{option.title}</strong>
                  <span>{categoryLabels[option.category]} · {option.difficulty}</span>
                  <span className="play-label">Play this case →</span>
                </button>
              ))}
            </div>
            <button className="text-button compact" type="button" onClick={() => dispatch({ type: "RETURN_TO_ATTRACT" })}>Back to attract screen</button>
          </section>
        )}

        {scenario && (state.screen === "SCENARIO" || state.screen === "DECISION") && (
          <section aria-labelledby="scenario-title">
            <div className="task-heading">
              <div><span className="eyebrow">{categoryLabels[scenario.category]} · {scenario.difficulty}</span><h1 id="scenario-title">{scenario.title}</h1><p>{scenario.introduction}</p></div>
              <div className="session-indicators">
                {countdown.remainingSeconds !== null && <div className={`timer ${countdown.remainingSeconds <= 10 ? "timer-warning" : ""}`} role="timer" aria-label={`${countdown.remainingSeconds} seconds remaining`}><strong>{countdown.remainingSeconds}</strong><span>seconds</span></div>}
                {!staffSettings.timerEnabled && !state.isReplay && <div className="mode-badge">Timer off</div>}
                {scenario.activity === "cipher"
                  ? <div className="clue-counter" aria-live="polite"><strong>{state.cipherHintsUsed}</strong><span>hints used</span></div>
                  : <div className="clue-counter" aria-live="polite"><strong>{state.selectedClueIds.length}</strong><span>clues flagged</span></div>}
              </div>
            </div>
            <div className="game-layout">
              <ScenarioDisplay
                scenario={scenario}
                selectedClueIds={state.selectedClueIds}
                cipherShift={state.cipherShift}
                cipherWordIndex={state.cipherWordIndex}
                cipherDraft={state.cipherDraft}
                cipherKeyword={state.cipherKeyword}
                interactive={state.screen === "SCENARIO" && !state.isReplay}
                onToggle={(clueId) => dispatch({ type: "TOGGLE_CLUE", clueId })}
                onCipherShiftChange={(shift) => dispatch({ type: "SET_CIPHER_SHIFT", shift })}
                onCipherLetter={(letter) => dispatch({ type: "APPEND_CIPHER_LETTER", letter })}
                onCipherBackspace={() => dispatch({ type: "REMOVE_CIPHER_LETTER" })}
                onCipherKeyword={(keyword) => dispatch({ type: "SET_CIPHER_KEYWORD", keyword })}
              />
              <aside className="action-panel" aria-label={scenario.activity === "cipher" ? "Cipher controls" : "Investigation controls"}>
                {state.isReplay ? <><h2>Prepared demonstration</h2><p>This reviewed example is progressing automatically. Tap or press any key to return to the attract screen.</p></> : state.screen === "SCENARIO" ? <>
                  {scenario.activity === "cipher" ? <>
                    <h2>{countdown.expired ? "Time’s up — keep going" : "Find the readable message"}</h2>
                    <p>{scenario.content.cipherType === "caesar"
                      ? "Rotate the alphabet, then lock in each word. The rotation resets before the next word."
                      : scenario.content.cipherType === "vigenere"
                        ? "Test a keyword, then lock in each word. An incorrect reviewed keyword is selected before the next word."
                        : "Use the decoder designed for this cipher, then lock in each word. The discovered mapping carries forward."}</p>
                    {state.cipherHintsUsed > 0 && <ol className="hint-list" aria-label="Cipher hints">{scenario.content.hints.slice(0, state.cipherHintsUsed).map((hint) => <li key={hint}>{hint}</li>)}</ol>}
                    {state.cipherAttemptIncorrect && <p className="attempt-status" role="status">That word is not readable yet — adjust the decoder and try again.</p>}
                    {state.cipherHintsUsed < 2 && <button className="quiet-button" type="button" onClick={() => dispatch({ type: "SHOW_CIPHER_HINT" })}>Show hint {state.cipherHintsUsed + 1}</button>}
                    <button className="primary-button" type="button" onClick={() => dispatch({
                      type: "SUBMIT_CIPHER",
                      correct: cipherAttemptCorrect,
                      lastWord: state.cipherWordIndex === cipherWords.length - 1,
                      nextShift: scenario.content.cipherType === "caesar" ? 0 : undefined,
                      nextKeyword: nextCipherKeyword
                    })}>Lock in word</button>
                    <button className="text-button" type="button" onClick={() => dispatch({ type: "RETURN_TO_CASES" })}>Choose another case</button>
                  </> : <>
                    <h2>Ready to decide?</h2>
                    <p>Flag anything suspicious, then make your safety decision.</p>
                    <button className="primary-button" type="button" onClick={() => dispatch({ type: "OPEN_DECISION" })}>Make my decision</button>
                  </>}
                </> : <>
                  <h2>{countdown.expired ? "Time’s up — what should you do?" : "What should you do?"}</h2>
                  <p>Choose the safest response to this situation.</p>
                  <div className="decision-list">
                    {(Object.keys(decisionLabels) as Decision[]).map((decision) => (
                      <button key={decision} type="button" onClick={() => dispatch({ type: "DECIDE", decision })}>{decisionLabels[decision]}</button>
                    ))}
                  </div>
                  <button className="text-button" type="button" onClick={() => dispatch({ type: "RETURN_TO_CASES" })}>Choose another case</button>
                </>}
              </aside>
            </div>
          </section>
        )}

        {scenario && state.screen === "REVEAL" && (
          <section className="reveal" aria-labelledby="reveal-title">
            <span className="eyebrow">{state.isReplay ? "Prepared demonstration · Reveal" : scenario.activity === "cipher" ? "Cipher revealed" : "Evidence reveal"}</span>
            <h1 id="reveal-title">{scenario.activity === "cipher" ? "Message decoded" : "Here’s what the scenario was hiding"}</h1>
            {scenario.activity === "cipher" ? <>
              <p className="lead"><strong>{scenario.content.plaintext}</strong></p>
              <div className="evidence-grid"><article className="evidence-card safe-evidence"><span className="status found">✓ {cipherRevealLabel}</span><h2>Why this cipher is weak</h2><p>{scenario.content.revealExplanation}</p></article></div>
            </> : <>
              <p className="lead">The response was <strong>{state.decision ? decisionLabels[state.decision] : "not selected"}</strong>. The recommended response is <strong>{decisionLabels[scenario.correctDecision]}</strong>.</p>
              <div className="evidence-grid">
                {scenario.clues.length === 0 && <article className="evidence-card safe-evidence"><span className="status found">✓ Prepared safe example</span><h2>No designed warning signs</h2><p>This message has an expected context, asks for no credentials or payment, and recommends independent navigation.</p></article>}
                {scenario.clues.map((clue) => {
                  const found = state.selectedClueIds.includes(clue.id);
                  return <article className="evidence-card" key={clue.id}><span className={`status ${found ? "found" : "missed"}`}>{found ? "✓ Identified" : "○ Worth noticing"}</span><h2>{clue.label}</h2><p>{clue.explanation}</p><small>Impact: {clue.severity}</small></article>;
                })}
                {scenario.decoys.filter((decoy) => state.selectedClueIds.includes(decoy.id)).map((decoy) => <article className="evidence-card false-positive" key={decoy.id}><span className="status review">△ False positive</span><h2>{decoy.label}</h2><p>{decoy.explanation}</p><small>Useful caution, but not a warning sign here</small></article>)}
              </div>
            </>}
            {!state.isReplay && <button className="primary-button centred" type="button" onClick={() => dispatch({ type: "SHOW_RESULT" })}>See my result</button>}
          </section>
        )}

        {scenario && score && state.screen === "RESULT" && (
          <section className="result panel" aria-labelledby="result-title">
            <span className="eyebrow">{state.isReplay ? "Prepared demonstration complete" : `${scenario.activity === "cipher" ? "Cipher complete" : "Investigation complete"} · ${scenario.title}`}</span>
            <h1 id="result-title">{resultLabel(score.points, score.maximum)}</h1>
            <p className="score"><strong>{score.points}</strong><span>out of {score.maximum} points</span></p>
            <p>{state.isReplay
              ? "This is a prepared example using reviewed local content."
              : scenario.activity === "cipher"
                ? `You decoded the message using ${state.cipherHintsUsed} ${state.cipherHintsUsed === 1 ? "hint" : "hints"} and made ${state.cipherIncorrectAttempts} incorrect ${state.cipherIncorrectAttempts === 1 ? "lock-in" : "lock-ins"}.`
                : `You identified ${score.correctClues} of ${scenario.clues.length} warning signs, marked ${score.falsePositives} benign ${score.falsePositives === 1 ? "detail" : "details"}, and your final decision was ${score.decisionCorrect ? "a strong defensive choice" : "a chance to practise checking before acting"}.`}</p>
            <div className="learning-box"><h2>Take this with you</h2><p>{scenario.takeaway}</p></div>
            <div className="career-box"><h2>A cybersecurity career connection</h2><p>{scenario.careerConnection}</p></div>
            {!state.isReplay && <><p className="perspective">A score is just one practice round—not a guarantee about real-world safety.</p><div className="result-actions"><button className="primary-button" type="button" onClick={() => dispatch({ type: "NEXT_CASE" })}>Choose the next case</button><button className="quiet-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Reset for next visitor</button></div></>}
          </section>
        )}

        {!scenario && !["ATTRACT", "INTRO"].includes(state.screen) && (
          <section className="panel" aria-live="assertive"><h1>That case could not be loaded</h1><p>Return to the case list and choose another prepared scenario.</p><button className="primary-button" type="button" onClick={() => dispatch({ type: "RETURN_TO_CASES" })}>Return to case list</button></section>
        )}
      </main>

      <StaffControls
        open={staffOpen}
        settings={staffSettings}
        scenarios={deck}
        selectedScenarioId={selectedStaffScenarioId}
        replayRunning={replay.running}
        onClose={() => setStaffOpen(false)}
        onSettingsChange={setStaffSettings}
        onSelectedScenarioChange={setSelectedStaffScenarioId}
        onStartScenario={() => closeAnd(() => dispatch({ type: "START_SCENARIO", scenarioId: selectedStaffScenarioId }))}
        onStartReplay={() => closeAnd(() => replay.start(selectedStaffScenarioId))}
        onStopReplay={replay.stop}
        onReturnToAttract={() => closeAnd(() => replay.running ? replay.stop() : dispatch({ type: "RETURN_TO_ATTRACT" }))}
        onReset={() => closeAnd(() => replay.running ? replay.stop() : dispatch({ type: "RESET" }))}
      />
      <footer>Cybersecurity depends on careful design, verification, and informed decisions.</footer>
    </div>
  );
}
