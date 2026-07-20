import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import type { GameAction, GameState } from "../state/game";
import type { Scenario } from "../types/scenario";

type Options = {
  state: GameState;
  deck: Scenario[];
  dispatch: Dispatch<GameAction>;
  loop: boolean;
  stepMilliseconds: number;
};

export function usePreparedReplay({ state, deck, dispatch, loop, stepMilliseconds }: Options) {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const nextIndexRef = useRef(0);
  const scenario = state.scenarioId ? deck.find((candidate) => candidate.id === state.scenarioId) : undefined;

  const start = useCallback((scenarioId: string) => {
    const selectedIndex = deck.findIndex((candidate) => candidate.id === scenarioId);
    nextIndexRef.current = selectedIndex >= 0 ? selectedIndex : 0;
    setRunning(true);
    setStage(0);
    dispatch({ type: "START_REPLAY", scenarioId });
  }, [deck, dispatch]);

  const stop = useCallback(() => {
    setRunning(false);
    setStage(0);
    dispatch({ type: "RESET" });
  }, [dispatch]);

  useEffect(() => {
    if (!running) return;
    const interrupt = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      stop();
    };
    window.addEventListener("pointerdown", interrupt, true);
    window.addEventListener("keydown", interrupt, true);
    return () => {
      window.removeEventListener("pointerdown", interrupt, true);
      window.removeEventListener("keydown", interrupt, true);
    };
  }, [running, stop]);

  useEffect(() => {
    if (!running) return;
    if (stage < 4 && !scenario) return;

    const timer = window.setTimeout(() => {
      switch (stage) {
        case 0:
          dispatch({ type: "SET_REPLAY_CLUES", clueIds: scenario!.clues.slice(0, 3).map((clue) => clue.id) });
          setStage(1);
          break;
        case 1:
          dispatch({ type: "OPEN_DECISION" });
          setStage(2);
          break;
        case 2:
          dispatch({ type: "DECIDE", decision: scenario!.correctDecision });
          setStage(3);
          break;
        case 3:
          dispatch({ type: "SHOW_RESULT" });
          setStage(4);
          break;
        case 4:
          dispatch({ type: "RETURN_TO_ATTRACT" });
          setStage(5);
          break;
        default:
          if (!loop) {
            setRunning(false);
            setStage(0);
            break;
          }
          nextIndexRef.current = (nextIndexRef.current + 1) % deck.length;
          dispatch({ type: "START_REPLAY", scenarioId: deck[nextIndexRef.current].id });
          setStage(0);
      }
    }, stepMilliseconds);

    return () => window.clearTimeout(timer);
  }, [deck, dispatch, loop, running, scenario, stage, stepMilliseconds]);

  return { running, start, stop };
}
