import type { Decision, Scenario } from "../types/scenario";

export type GameScreen = "INTRO" | "SCENARIO" | "DECISION" | "REVEAL" | "RESULT";

export type GameState = {
  screen: GameScreen;
  scenarioId: string | null;
  selectedClueIds: string[];
  decision: Decision | null;
};

export type GameAction =
  | { type: "BEGIN"; scenarioId: string }
  | { type: "TOGGLE_CLUE"; clueId: string }
  | { type: "OPEN_DECISION" }
  | { type: "DECIDE"; decision: Decision }
  | { type: "SHOW_RESULT" }
  | { type: "RESET" };

export const initialGameState: GameState = {
  screen: "INTRO",
  scenarioId: null,
  selectedClueIds: [],
  decision: null
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "BEGIN":
      return state.screen === "INTRO" && action.scenarioId
        ? { ...initialGameState, scenarioId: action.scenarioId, screen: "SCENARIO" }
        : state;
    case "TOGGLE_CLUE": {
      if (state.screen !== "SCENARIO") return state;
      const selected = state.selectedClueIds.includes(action.clueId);
      return {
        ...state,
        selectedClueIds: selected
          ? state.selectedClueIds.filter((id) => id !== action.clueId)
          : [...state.selectedClueIds, action.clueId]
      };
    }
    case "OPEN_DECISION":
      return state.screen === "SCENARIO" ? { ...state, screen: "DECISION" } : state;
    case "DECIDE":
      return state.screen === "DECISION" ? { ...state, decision: action.decision, screen: "REVEAL" } : state;
    case "SHOW_RESULT":
      return state.screen === "REVEAL" ? { ...state, screen: "RESULT" } : state;
    case "RESET":
      return initialGameState;
  }
}

export type Score = { correctClues: number; missedClues: number; falsePositives: number; decisionCorrect: boolean; points: number; maximum: number };

export function scoreGame(scenario: Scenario, selectedClueIds: string[], decision: Decision | null): Score {
  const clueIds = new Set(scenario.clues.map((clue) => clue.id));
  const selections = new Set(selectedClueIds);
  const correctClues = [...selections].filter((id) => clueIds.has(id)).length;
  const falsePositives = [...selections].filter((id) => !clueIds.has(id)).length;
  const missedClues = clueIds.size - correctClues;
  const decisionCorrect = decision === scenario.correctDecision;
  const maximum = clueIds.size * 10 + 20;
  const points = Math.max(0, correctClues * 10 - falsePositives * 2 + (decisionCorrect ? 20 : 0));
  return { correctClues, missedClues, falsePositives, decisionCorrect, points, maximum };
}

export function resultLabel(points: number, maximum: number): string {
  const ratio = maximum === 0 ? 0 : points / maximum;
  if (ratio >= 0.9) return "Expert Spotter";
  if (ratio >= 0.7) return "Security Analyst";
  if (ratio >= 0.45) return "Sharp Investigator";
  return "Cyber Scout";
}
