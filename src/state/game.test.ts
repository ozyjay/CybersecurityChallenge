import { describe, expect, it } from "vitest";
import { scenarios } from "../scenarios";
import { gameReducer, initialGameState, scoreCipher, scoreGame } from "./game";
import type { InvestigationScenario } from "../types/scenario";

const accountWarning = scenarios.find((scenario): scenario is InvestigationScenario => scenario.activity === "investigation" && scenario.familyId === "urgent-account-warning")!;

describe("game state", () => {
  it("runs the main state transitions", () => {
    let state = gameReducer(initialGameState, { type: "OPEN_CASES" });
    state = gameReducer(state, { type: "BEGIN", scenarioId: accountWarning.id });
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

  it.each(["ATTRACT", "INTRO", "SCENARIO", "DECISION", "REVEAL", "RESULT"] as const)("resets cleanly from %s", (screen) => {
    expect(gameReducer({ ...initialGameState, screen, round: 3, lastCompletedScenarioId: "previous:variant", scenarioId: accountWarning.id, selectedClueIds: ["sender-mismatch"], decision: "safe", cipherShift: 9, cipherHintsUsed: 2, cipherIncorrectAttempts: 3 }, { type: "RESET" })).toEqual({ ...initialGameState, round: 4 });
  });

  it("tracks cipher shifts, hints, attempts, and successful submission", () => {
    let state = gameReducer(initialGameState, { type: "START_SCENARIO", scenarioId: "secret-caesar-cipher:original" });
    state = gameReducer(state, { type: "SET_CIPHER_SHIFT", shift: -1 });
    expect(state.cipherShift).toBe(25);
    state = gameReducer(state, { type: "SHOW_CIPHER_HINT" });
    state = gameReducer(state, { type: "SHOW_CIPHER_HINT" });
    state = gameReducer(state, { type: "SHOW_CIPHER_HINT" });
    expect(state.cipherHintsUsed).toBe(2);
    state = gameReducer(state, { type: "SUBMIT_CIPHER", correct: false });
    expect(state).toMatchObject({ screen: "SCENARIO", cipherIncorrectAttempts: 1 });
    expect(gameReducer(state, { type: "SUBMIT_CIPHER", correct: true }).screen).toBe("REVEAL");
  });

  it("excludes only the completed variant when continuing", () => {
    const resultState = { ...initialGameState, screen: "RESULT" as const, round: 2, scenarioId: accountWarning.id };
    expect(gameReducer(resultState, { type: "NEXT_CASE" })).toEqual({
      ...initialGameState,
      screen: "INTRO",
      round: 3,
      lastCompletedScenarioId: accountWarning.id
    });
  });

  it("preserves completion history when returning from an unfinished case", () => {
    const decisionState = { ...initialGameState, screen: "DECISION" as const, round: 2, lastCompletedScenarioId: "previous:variant", scenarioId: accountWarning.id };
    expect(gameReducer(decisionState, { type: "RETURN_TO_CASES" })).toEqual({
      ...initialGameState,
      screen: "INTRO",
      round: 3,
      lastCompletedScenarioId: "previous:variant"
    });
  });

  it("runs prepared replay transitions only in replay mode", () => {
    let state = gameReducer(initialGameState, { type: "START_REPLAY", scenarioId: accountWarning.id });
    expect(state).toMatchObject({ screen: "SCENARIO", isReplay: true, scenarioId: accountWarning.id });
    state = gameReducer(state, { type: "SET_REPLAY_CLUES", clueIds: ["sender-mismatch", "sender-mismatch"] });
    expect(state.selectedClueIds).toEqual(["sender-mismatch"]);
    expect(gameReducer({ ...state, isReplay: false }, { type: "SET_REPLAY_CLUES", clueIds: ["other"] }).selectedClueIds).toEqual(["sender-mismatch"]);
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
    const safeScenario = scenarios.find((scenario): scenario is InvestigationScenario => scenario.activity === "investigation" && scenario.correctDecision === "safe")!;
    expect(scoreGame(safeScenario, [], "safe")).toMatchObject({ correctClues: 0, missedClues: 0, falsePositives: 0, points: 20, maximum: 20 });
    expect(scoreGame(safeScenario, [safeScenario.decoys[0].id], "safe").points).toBe(18);
  });

  it("scores cipher hints and incorrect attempts gently", () => {
    expect(scoreCipher(0, 0)).toMatchObject({ points: 100, maximum: 100 });
    expect(scoreCipher(2, 3).points).toBe(65);
    expect(scoreCipher(2, 30).points).toBe(0);
  });
});
