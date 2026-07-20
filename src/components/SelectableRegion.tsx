import type { ReactNode } from "react";
import type { Clue } from "../types/scenario";

type Props = {
  region: string;
  clues: Clue[];
  selectedClueIds: string[];
  interactive: boolean;
  onToggle: (clueId: string) => void;
  children: ReactNode;
  className?: string;
};

export function SelectableRegion({ region, clues, selectedClueIds, interactive, onToggle, children, className = "" }: Props) {
  const clue = clues.find((candidate) => candidate.selectableRegion === region);
  if (!clue || !interactive) return <div className={`message-region ${className}`.trim()}>{children}</div>;

  const pressed = selectedClueIds.includes(clue.id);
  return (
    <button
      type="button"
      className={`message-region clue-button ${className}`.trim()}
      aria-pressed={pressed}
      aria-label={`${clue.label}${pressed ? ", selected as suspicious" : ", select as suspicious"}`}
      onClick={() => onToggle(clue.id)}
    >
      {children}
      <span className="selection-mark" aria-hidden="true">{pressed ? "✓ Flagged" : "Inspect"}</span>
    </button>
  );
}
