import { describe, expect, it } from "vitest";
import { scenarios } from "../scenarios";
import { gameReducer, initialGameState, scoreGame } from "./game";

const accountWarning = scenarios.find((scenario) => scenario.familyId === "urgent-account-warning")!;

describe("game state", () => {
  it("runs the main state transitions", () => {
    let state = gameReducer(initialGameState, { type: "BEGIN", scenarioId: accountWarning.id });
    expect(state.scenarioId).toBe(accountWarning.id);
    state = gameReducer(state, { type: "TOGGLE_CLUE", clueId: "sender-mismatch" });
    state = gameReducer(state, { type: "TOGGLE_CLUE", clueId: "sender-mismatch" });
    expect(state.selectedClueIds).toEqual([]);
    state = gameReducer(state, { type: "TOGGLE_CLUE", clueId: "sender-mismatch" });
    state = gameReducer(state, { type: "OPEN_DECISION" });
    state = gameReducer(state, { type: "DECIDE", decision: "escalate" });
    expect(state.screen).toBe("REVEAL");
    expect(state.decision).toBe("escalate");
    expect(gameReducer(state, { type: "SHOW_RESULT" }).screen).toBe("RESULT");
  });

  it.each(["INTRO", "SCENARIO", "DECISION", "REVEAL", "RESULT"] as const)("resets cleanly from %s", (screen) => {
    expect(gameReducer({ screen, round: 3, lastCompletedScenarioId: "previous:variant", scenarioId: accountWarning.id, selectedClueIds: ["sender-mismatch"], decision: "safe" }, { type: "RESET" })).toEqual({ ...initialGameState, round: 4 });
  });

  it("excludes only the completed variant when continuing", () => {
    const resultState = { ...initialGameState, screen: "RESULT" as const, round: 2, scenarioId: accountWarning.id };
    expect(gameReducer(resultState, { type: "NEXT_CASE" })).toEqual({
      ...initialGameState,
      round: 3,
      lastCompletedScenarioId: accountWarning.id
    });
  });

  it("preserves completion history when returning from an unfinished case", () => {
    const decisionState = { ...initialGameState, screen: "DECISION" as const, round: 2, lastCompletedScenarioId: "previous:variant", scenarioId: accountWarning.id };
    expect(gameReducer(decisionState, { type: "RETURN_TO_CASES" })).toEqual({
      ...initialGameState,
      round: 3,
      lastCompletedScenarioId: "previous:variant"
    });
  });
});

describe("scoring", () => {
  it("rewards identified clues and the correct decision", () => {
    const ids = accountWarning.clues.map((clue) => clue.id);
    expect(scoreGame(accountWarning, ids, "escalate")).toMatchObject({ points: 80, maximum: 80, missedClues: 0, decisionCorrect: true });
  });

  it("deduplicates selections and applies a small false-positive penalty", () => {
    expect(scoreGame(accountWarning, ["sender-mismatch", "sender-mismatch", accountWarning.decoys[0].id], "safe")).toMatchObject({ correctClues: 1, falsePositives: 1, points: 8 });
  });

  it("rewards recognising the safe comparison without requiring warning signs", () => {
    const safeScenario = scenarios.find((scenario) => scenario.correctDecision === "safe")!;
    expect(scoreGame(safeScenario, [], "safe")).toMatchObject({ correctClues: 0, missedClues: 0, falsePositives: 0, points: 20, maximum: 20 });
    expect(scoreGame(safeScenario, [safeScenario.decoys[0].id], "safe").points).toBe(18);
  });
});
