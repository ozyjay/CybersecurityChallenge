import { useReducer } from "react";
import { EmailScenario } from "./components/EmailScenario";
import { accountWarning } from "./scenarios/accountWarning";
import { assertValidScenario } from "./scenarios/validate";
import { gameReducer, initialGameState, resultLabel, scoreGame } from "./state/game";
import type { Decision } from "./types/scenario";

assertValidScenario(accountWarning);

const decisionLabels: Record<Decision, string> = {
  safe: "Safe",
  suspicious: "Suspicious",
  escalate: "Report or escalate"
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const score = scoreGame(accountWarning, state.selectedClueIds, state.decision);

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
          <section className="intro panel" aria-labelledby="intro-title">
            <span className="eyebrow">A 60-second cyber investigation</span>
            <h1 id="intro-title">Can you spot the warning signs?</h1>
            <p className="lead">Look for warning signs before you trust a message, link, or login page.</p>
            <button className="primary-button" type="button" onClick={() => dispatch({ type: "BEGIN" })}>Tap to begin</button>
            <p className="privacy-note">This is a fictional local simulation. It does not collect passwords or personal information.</p>
          </section>
        )}

        {(state.screen === "SCENARIO" || state.screen === "DECISION") && (
          <section aria-labelledby="scenario-title">
            <div className="task-heading">
              <div><span className="eyebrow">Case 01 · Starter</span><h1 id="scenario-title">{accountWarning.title}</h1><p>{accountWarning.introduction}</p></div>
              <div className="clue-counter" aria-live="polite"><strong>{state.selectedClueIds.length}</strong><span>clues flagged</span></div>
            </div>
            <div className="game-layout">
              <EmailScenario
                scenario={accountWarning}
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
                  <p>Choose the safest response to this message.</p>
                  <div className="decision-list">
                    {(Object.keys(decisionLabels) as Decision[]).map((decision) => (
                      <button key={decision} type="button" onClick={() => dispatch({ type: "DECIDE", decision })}>{decisionLabels[decision]}</button>
                    ))}
                  </div>
                  <button className="text-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Start over</button>
                </>}
              </aside>
            </div>
          </section>
        )}

        {state.screen === "REVEAL" && (
          <section className="reveal" aria-labelledby="reveal-title">
            <span className="eyebrow">Evidence reveal</span>
            <h1 id="reveal-title">Here’s what the message was hiding</h1>
            <p className="lead">You chose <strong>{state.decision ? decisionLabels[state.decision] : "no decision"}</strong>. The safest response is to report or escalate it.</p>
            <div className="evidence-grid">
              {accountWarning.clues.map((clue) => {
                const found = state.selectedClueIds.includes(clue.id);
                return <article className="evidence-card" key={clue.id}><span className={`status ${found ? "found" : "missed"}`}>{found ? "✓ You found this" : "○ Worth noticing"}</span><h2>{clue.label}</h2><p>{clue.explanation}</p><small>Impact: {clue.severity}</small></article>;
              })}
            </div>
            <button className="primary-button centred" type="button" onClick={() => dispatch({ type: "SHOW_RESULT" })}>See my result</button>
          </section>
        )}

        {state.screen === "RESULT" && (
          <section className="result panel" aria-labelledby="result-title">
            <span className="eyebrow">Investigation complete</span>
            <h1 id="result-title">{resultLabel(score.points, score.maximum)}</h1>
            <p className="score"><strong>{score.points}</strong><span>out of {score.maximum} points</span></p>
            <p>You identified {score.correctClues} of {accountWarning.clues.length} warning signs and your final decision was {score.decisionCorrect ? "a strong defensive choice" : "a chance to practise checking before acting"}.</p>
            <div className="learning-box"><h2>Take this with you</h2><p>{accountWarning.takeaway}</p></div>
            <div className="career-box"><h2>A cybersecurity career connection</h2><p>{accountWarning.careerConnection}</p></div>
            <p className="perspective">A score is just one practice round—not a guarantee about real-world safety.</p>
            <button className="primary-button" type="button" onClick={() => dispatch({ type: "RESET" })}>Reset for next visitor</button>
          </section>
        )}
      </main>
      <footer>Cybersecurity depends on careful design, verification, and informed decisions.</footer>
    </div>
  );
}
