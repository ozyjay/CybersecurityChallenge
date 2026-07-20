import { useMemo, useReducer, useRef } from "react";
import { ScenarioDisplay } from "./components/ScenarioDisplay";
import { buildScenarioDeck } from "./scenarios";
import { createRandomSeed } from "./scenarios/randomise";
import { gameReducer, initialGameState, resultLabel, scoreGame } from "./state/game";
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
  permissions: "Permission request"
};

type AppProps = { seed?: number };

export default function App({ seed }: AppProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const baseSeed = useRef(seed ?? createRandomSeed());
  const deck = useMemo(
    () => buildScenarioDeck(baseSeed.current + state.round, state.lastCompletedScenarioId ? [state.lastCompletedScenarioId] : []),
    [state.lastCompletedScenarioId, state.round]
  );
  const scenario = state.scenarioId ? deck.find((candidate) => candidate.id === state.scenarioId) : undefined;
  const score = scenario ? scoreGame(scenario, state.selectedClueIds, state.decision) : null;

  const resetButton = state.screen !== "INTRO" && state.screen !== "RESULT" && (
    <button className="quiet-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Reset for next visitor</button>
  );

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#main" aria-label="Can You Spot the Scam? home">Can You Spot the Scam?</a>
        {resetButton}
      </header>
      <main id="main" className="main-content">
        {state.screen === "INTRO" && (
          <section className="intro scenario-intro" aria-labelledby="intro-title">
            <span className="eyebrow">A 60-second cyber investigation</span>
            <h1 id="intro-title">Can you spot the warning signs?</h1>
            <p className="lead">Look for warning signs before you trust a message, link, or login page. Choose a fictional case to begin.</p>
            <div className="scenario-picker" aria-label="Choose a scenario">
              {deck.map((option, index) => (
                <button className="scenario-choice" type="button" key={option.id} data-scenario-id={option.id} onClick={() => dispatch({ type: "BEGIN", scenarioId: option.id })}>
                  <span className="case-number">Case {String(index + 1).padStart(2, "0")}</span>
                  <strong>{option.title}</strong>
                  <span>{categoryLabels[option.category]} · {option.difficulty}</span>
                  <span className="play-label">Play this case →</span>
                </button>
              ))}
            </div>
            <p className="privacy-note">This is a fictional local simulation. It does not collect passwords or personal information.</p>
          </section>
        )}

        {scenario && (state.screen === "SCENARIO" || state.screen === "DECISION") && (
          <section aria-labelledby="scenario-title">
            <div className="task-heading">
              <div><span className="eyebrow">{categoryLabels[scenario.category]} · {scenario.difficulty}</span><h1 id="scenario-title">{scenario.title}</h1><p>{scenario.introduction}</p></div>
              <div className="clue-counter" aria-live="polite"><strong>{state.selectedClueIds.length}</strong><span>clues flagged</span></div>
            </div>
            <div className="game-layout">
              <ScenarioDisplay
                scenario={scenario}
                selectedClueIds={state.selectedClueIds}
                interactive={state.screen === "SCENARIO"}
                onToggle={(clueId) => dispatch({ type: "TOGGLE_CLUE", clueId })}
              />
              <aside className="action-panel" aria-label="Investigation controls">
                {state.screen === "SCENARIO" ? <>
                  <h2>Ready to decide?</h2>
                  <p>Flag anything suspicious, then make your safety decision.</p>
                  <button className="primary-button" type="button" onClick={() => dispatch({ type: "OPEN_DECISION" })}>Make my decision</button>
                </> : <>
                  <h2>What should you do?</h2>
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
            <span className="eyebrow">Evidence reveal</span>
            <h1 id="reveal-title">Here’s what the scenario was hiding</h1>
            <p className="lead">You chose <strong>{state.decision ? decisionLabels[state.decision] : "no decision"}</strong>. The recommended response is <strong>{decisionLabels[scenario.correctDecision]}</strong>.</p>
            <div className="evidence-grid">
              {scenario.clues.length === 0 && (
                <article className="evidence-card safe-evidence"><span className="status found">✓ Prepared safe example</span><h2>No designed warning signs</h2><p>This message has an expected context, asks for no credentials or payment, and recommends independent navigation.</p></article>
              )}
              {scenario.clues.map((clue) => {
                const found = state.selectedClueIds.includes(clue.id);
                return <article className="evidence-card" key={clue.id}><span className={`status ${found ? "found" : "missed"}`}>{found ? "✓ You found this" : "○ Worth noticing"}</span><h2>{clue.label}</h2><p>{clue.explanation}</p><small>Impact: {clue.severity}</small></article>;
              })}
              {scenario.decoys.filter((decoy) => state.selectedClueIds.includes(decoy.id)).map((decoy) => (
                <article className="evidence-card false-positive" key={decoy.id}><span className="status review">△ False positive</span><h2>{decoy.label}</h2><p>{decoy.explanation}</p><small>Useful caution, but not a warning sign here</small></article>
              ))}
            </div>
            <button className="primary-button centred" type="button" onClick={() => dispatch({ type: "SHOW_RESULT" })}>See my result</button>
          </section>
        )}

        {scenario && score && state.screen === "RESULT" && (
          <section className="result panel" aria-labelledby="result-title">
            <span className="eyebrow">Investigation complete · {scenario.title}</span>
            <h1 id="result-title">{resultLabel(score.points, score.maximum)}</h1>
            <p className="score"><strong>{score.points}</strong><span>out of {score.maximum} points</span></p>
            <p>You identified {score.correctClues} of {scenario.clues.length} warning signs, marked {score.falsePositives} benign {score.falsePositives === 1 ? "detail" : "details"}, and your final decision was {score.decisionCorrect ? "a strong defensive choice" : "a chance to practise checking before acting"}.</p>
            <div className="learning-box"><h2>Take this with you</h2><p>{scenario.takeaway}</p></div>
            <div className="career-box"><h2>A cybersecurity career connection</h2><p>{scenario.careerConnection}</p></div>
            <p className="perspective">A score is just one practice round—not a guarantee about real-world safety.</p>
            <div className="result-actions">
              <button className="primary-button" type="button" onClick={() => dispatch({ type: "NEXT_CASE" })}>Choose the next case</button>
              <button className="quiet-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Reset for next visitor</button>
            </div>
          </section>
        )}

        {!scenario && state.screen !== "INTRO" && (
          <section className="panel" aria-live="assertive"><h1>That case could not be loaded</h1><p>Return to the case list and choose another prepared scenario.</p><button className="primary-button" type="button" onClick={() => dispatch({ type: "RETURN_TO_CASES" })}>Return to case list</button></section>
        )}
      </main>
      <footer>Cybersecurity depends on careful design, verification, and informed decisions.</footer>
    </div>
  );
}
