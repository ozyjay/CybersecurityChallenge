import type { Scenario } from "../types/scenario";

export type DifficultyFilter = "all" | "starter" | "intermediate";

export type StaffSettings = {
  timerEnabled: boolean;
  relaxedMode: boolean;
  soundEnabled: boolean;
  difficulty: DifficultyFilter;
  replayLoop: boolean;
};

type Props = {
  open: boolean;
  settings: StaffSettings;
  scenarios: Scenario[];
  selectedScenarioId: string;
  replayRunning: boolean;
  onClose: () => void;
  onSettingsChange: (settings: StaffSettings) => void;
  onSelectedScenarioChange: (scenarioId: string) => void;
  onStartScenario: () => void;
  onStartReplay: () => void;
  onStopReplay: () => void;
  onReturnToAttract: () => void;
  onReset: () => void;
};

export function StaffControls(props: Props) {
  if (!props.open) return null;
  const update = <Key extends keyof StaffSettings>(key: Key, value: StaffSettings[Key]) => {
    props.onSettingsChange({ ...props.settings, [key]: value });
  };

  return (
    <aside className="staff-panel" role="dialog" aria-modal="false" aria-labelledby="staff-title">
      <div className="staff-heading"><div><span className="eyebrow">Local booth controls</span><h2 id="staff-title">Staff controls</h2></div><button type="button" className="icon-button" aria-label="Close staff controls" onClick={props.onClose}>×</button></div>
      <p className="staff-hint">Shortcut: Ctrl + Alt + S. Settings remain only in this page session.</p>

      <fieldset><legend>Visitor settings</legend>
        <label><input type="checkbox" checked={props.settings.timerEnabled} onChange={(event) => update("timerEnabled", event.target.checked)} /> Timer enabled</label>
        <label><input type="checkbox" checked={props.settings.relaxedMode} onChange={(event) => update("relaxedMode", event.target.checked)} /> Relaxed 90-second timer</label>
        <label><input type="checkbox" checked={props.settings.soundEnabled} onChange={(event) => update("soundEnabled", event.target.checked)} /> Optional sound cues</label>
        <label className="stacked-label">Difficulty
          <select value={props.settings.difficulty} onChange={(event) => update("difficulty", event.target.value as DifficultyFilter)}>
            <option value="all">All cases</option><option value="starter">Starter only</option><option value="intermediate">Intermediate only</option>
          </select>
        </label>
      </fieldset>

      <fieldset><legend>Prepared replay</legend>
        <label><input type="checkbox" checked={props.settings.replayLoop} onChange={(event) => update("replayLoop", event.target.checked)} /> Loop automatically</label>
        <label className="stacked-label">Prepared case
          <select aria-label="Prepared scenario" value={props.selectedScenarioId} onChange={(event) => props.onSelectedScenarioChange(event.target.value)}>
            {props.scenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.title} · {scenario.variantId}</option>)}
          </select>
        </label>
        <div className="staff-actions">
          <button type="button" onClick={props.onStartScenario}>Start selected case</button>
          {props.replayRunning
            ? <button type="button" onClick={props.onStopReplay}>Stop prepared replay</button>
            : <button type="button" onClick={props.onStartReplay}>Start prepared replay</button>}
        </div>
      </fieldset>

      <div className="staff-actions">
        <button type="button" onClick={props.onReturnToAttract}>Return to attract screen</button>
        <button type="button" onClick={props.onReset}>Reset for next visitor</button>
      </div>
    </aside>
  );
}
