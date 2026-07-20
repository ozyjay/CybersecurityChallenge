import type { ReactNode } from "react";
import type { Clue, Decoy } from "../types/scenario";

type Props = {
  region: string;
  clues: Clue[];
  decoys: Decoy[];
  selectedClueIds: string[];
  interactive: boolean;
  onToggle: (clueId: string) => void;
  children: ReactNode;
  className?: string;
};

export function SelectableRegion({ region, clues, decoys, selectedClueIds, interactive, onToggle, children, className = "" }: Props) {
  const evidence = [...clues, ...decoys].find((candidate) => candidate.selectableRegion === region);
  if (!evidence || !interactive) return <div className={`message-region ${className}`.trim()}>{children}</div>;

  const pressed = selectedClueIds.includes(evidence.id);
  return (
    <button
      type="button"
      className={`message-region clue-button ${className}`.trim()}
      aria-pressed={pressed}
      aria-label={`${evidence.label}${pressed ? ", selected as suspicious" : ", select as suspicious"}`}
      onClick={() => onToggle(evidence.id)}
    >
      {children}
      <span className="selection-mark" aria-hidden="true">{pressed ? "✓ Flagged" : "Inspect"}</span>
    </button>
  );
}
