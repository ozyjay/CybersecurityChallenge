import type { Decision, InvestigationScenario } from "../types/scenario";

export type GameScreen = "ATTRACT" | "INTRO" | "SCENARIO" | "DECISION" | "REVEAL" | "RESULT";

export type GameState = {
  screen: GameScreen;
  round: number;
  lastCompletedScenarioId: string | null;
  scenarioId: string | null;
  selectedClueIds: string[];
  decision: Decision | null;
  cipherShift: number;
  cipherWordIndex: number;
  cipherHintsUsed: number;
  cipherIncorrectAttempts: number;
  cipherAttemptIncorrect: boolean;
  isReplay: boolean;
};

export type GameAction =
  | { type: "OPEN_CASES" }
  | { type: "BEGIN"; scenarioId: string }
  | { type: "START_SCENARIO"; scenarioId: string }
  | { type: "START_REPLAY"; scenarioId: string }
  | { type: "SET_REPLAY_CLUES"; clueIds: string[] }
  | { type: "TOGGLE_CLUE"; clueId: string }
  | { type: "OPEN_DECISION" }
  | { type: "DECIDE"; decision: Decision }
  | { type: "SET_CIPHER_SHIFT"; shift: number }
  | { type: "SHOW_CIPHER_HINT" }
  | { type: "SUBMIT_CIPHER"; correct: boolean; lastWord: boolean }
  | { type: "SET_REPLAY_CIPHER"; shift: number }
  | { type: "SHOW_RESULT" }
  | { type: "NEXT_CASE" }
  | { type: "RETURN_TO_CASES" }
  | { type: "RETURN_TO_ATTRACT" }
  | { type: "REPLAY_TO_ATTRACT" }
  | { type: "RESET" };

export const initialGameState: GameState = {
  screen: "ATTRACT",
  round: 0,
  lastCompletedScenarioId: null,
  scenarioId: null,
  selectedClueIds: [],
  decision: null,
  cipherShift: 0,
  cipherWordIndex: 0,
  cipherHintsUsed: 0,
  cipherIncorrectAttempts: 0,
  cipherAttemptIncorrect: false,
  isReplay: false
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "OPEN_CASES":
      return state.screen === "ATTRACT" ? { ...state, screen: "INTRO" } : state;
    case "BEGIN":
      return state.screen === "INTRO" && action.scenarioId
        ? { ...initialGameState, round: state.round, lastCompletedScenarioId: state.lastCompletedScenarioId, scenarioId: action.scenarioId, screen: "SCENARIO" }
        : state;
    case "START_SCENARIO":
      return action.scenarioId
        ? { ...initialGameState, round: state.round, lastCompletedScenarioId: state.lastCompletedScenarioId, scenarioId: action.scenarioId, screen: "SCENARIO" }
        : state;
    case "START_REPLAY":
      return action.scenarioId
        ? { ...initialGameState, round: state.round, scenarioId: action.scenarioId, screen: "SCENARIO", isReplay: true }
        : state;
    case "SET_REPLAY_CLUES":
      return state.screen === "SCENARIO" && state.isReplay ? { ...state, selectedClueIds: [...new Set(action.clueIds)] } : state;
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
    case "SET_CIPHER_SHIFT":
      return state.screen === "SCENARIO" && Number.isInteger(action.shift)
        ? { ...state, cipherShift: ((action.shift % 26) + 26) % 26, cipherAttemptIncorrect: false }
        : state;
    case "SHOW_CIPHER_HINT":
      return state.screen === "SCENARIO" ? { ...state, cipherHintsUsed: Math.min(2, state.cipherHintsUsed + 1) } : state;
    case "SUBMIT_CIPHER":
      if (state.screen !== "SCENARIO") return state;
      return action.correct
        ? action.lastWord
          ? { ...state, screen: "REVEAL" }
          : { ...state, cipherWordIndex: state.cipherWordIndex + 1, cipherAttemptIncorrect: false }
        : { ...state, cipherIncorrectAttempts: state.cipherIncorrectAttempts + 1, cipherAttemptIncorrect: true };
    case "SET_REPLAY_CIPHER":
      return state.screen === "SCENARIO" && state.isReplay
        ? { ...state, cipherShift: ((action.shift % 26) + 26) % 26, screen: "REVEAL" }
        : state;
    case "SHOW_RESULT":
      return state.screen === "REVEAL" ? { ...state, screen: "RESULT" } : state;
    case "NEXT_CASE":
      return state.screen === "RESULT" && state.scenarioId
        ? { ...initialGameState, screen: "INTRO", round: state.round + 1, lastCompletedScenarioId: state.scenarioId }
        : state;
    case "RETURN_TO_CASES":
      return { ...initialGameState, screen: "INTRO", round: state.round + 1, lastCompletedScenarioId: state.lastCompletedScenarioId };
    case "RETURN_TO_ATTRACT":
      return { ...initialGameState, round: state.round + 1 };
    case "REPLAY_TO_ATTRACT":
      return state.isReplay ? { ...initialGameState, round: state.round, isReplay: true } : state;
    case "RESET":
      return { ...initialGameState, round: state.round + 1 };
  }
}

export type Score = { correctClues: number; missedClues: number; falsePositives: number; decisionCorrect: boolean; points: number; maximum: number };

export function scoreGame(scenario: InvestigationScenario, selectedClueIds: string[], decision: Decision | null): Score {
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

export function scoreCipher(hintsUsed: number, incorrectAttempts: number): Score {
  const points = Math.max(0, 100 - Math.min(2, hintsUsed) * 10 - Math.max(0, incorrectAttempts) * 5);
  return { correctClues: 0, missedClues: 0, falsePositives: 0, decisionCorrect: true, points, maximum: 100 };
}

export function resultLabel(points: number, maximum: number): string {
  const ratio = maximum === 0 ? 0 : points / maximum;
  if (ratio >= 0.9) return "Expert Spotter";
  if (ratio >= 0.7) return "Security Analyst";
  if (ratio >= 0.45) return "Sharp Investigator";
  return "Cyber Scout";
}
