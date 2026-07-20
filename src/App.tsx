import { useReducer } from "react";
import { ScenarioDisplay } from "./components/ScenarioDisplay";
import { scenarios, scenarioById } from "./scenarios";
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

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const scenario = state.scenarioId ? scenarioById(state.scenarioId) : undefined;
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
              {scenarios.map((option, index) => (
                <button className="scenario-choice" type="button" key={option.id} onClick={() => dispatch({ type: "BEGIN", scenarioId: option.id })}>
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
                  <button className="text-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Choose another case</button>
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
              {scenario.clues.map((clue) => {
                const found = state.selectedClueIds.includes(clue.id);
                return <article className="evidence-card" key={clue.id}><span className={`status ${found ? "found" : "missed"}`}>{found ? "✓ You found this" : "○ Worth noticing"}</span><h2>{clue.label}</h2><p>{clue.explanation}</p><small>Impact: {clue.severity}</small></article>;
              })}
            </div>
            <button className="primary-button centred" type="button" onClick={() => dispatch({ type: "SHOW_RESULT" })}>See my result</button>
          </section>
        )}

        {scenario && score && state.screen === "RESULT" && (
          <section className="result panel" aria-labelledby="result-title">
            <span className="eyebrow">Investigation complete · {scenario.title}</span>
            <h1 id="result-title">{resultLabel(score.points, score.maximum)}</h1>
            <p className="score"><strong>{score.points}</strong><span>out of {score.maximum} points</span></p>
            <p>You identified {score.correctClues} of {scenario.clues.length} warning signs and your final decision was {score.decisionCorrect ? "a strong defensive choice" : "a chance to practise checking before acting"}.</p>
            <div className="learning-box"><h2>Take this with you</h2><p>{scenario.takeaway}</p></div>
            <div className="career-box"><h2>A cybersecurity career connection</h2><p>{scenario.careerConnection}</p></div>
            <p className="perspective">A score is just one practice round—not a guarantee about real-world safety.</p>
            <button className="primary-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Choose the next case</button>
          </section>
        )}

        {!scenario && state.screen !== "INTRO" && (
          <section className="panel" aria-live="assertive"><h1>That case could not be loaded</h1><p>Return to the case list and choose another prepared scenario.</p><button className="primary-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Return to case list</button></section>
        )}
      </main>
      <footer>Cybersecurity depends on careful design, verification, and informed decisions.</footer>
    </div>
  );
}
