import { describe, expect, it } from "vitest";
import { accountWarning } from "../scenarios/accountWarning";
import { gameReducer, initialGameState, scoreGame } from "./game";

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
    expect(gameReducer({ screen, scenarioId: accountWarning.id, selectedClueIds: ["sender-mismatch"], decision: "safe" }, { type: "RESET" })).toEqual(initialGameState);
  });
});

describe("scoring", () => {
  it("rewards identified clues and the correct decision", () => {
    const ids = accountWarning.clues.map((clue) => clue.id);
    expect(scoreGame(accountWarning, ids, "escalate")).toMatchObject({ points: 80, maximum: 80, missedClues: 0, decisionCorrect: true });
  });

  it("deduplicates selections and applies a small false-positive penalty", () => {
    expect(scoreGame(accountWarning, ["sender-mismatch", "sender-mismatch", "not-a-clue"], "safe")).toMatchObject({ correctClues: 1, falsePositives: 1, points: 8 });
  });
});
