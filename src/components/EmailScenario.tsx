import type { Scenario } from "../types/scenario";
import { SelectableRegion } from "./SelectableRegion";

type Props = {
  scenario: Scenario;
  selectedClueIds: string[];
  interactive: boolean;
  onToggle: (clueId: string) => void;
};

export function EmailScenario({ scenario, selectedClueIds, interactive, onToggle }: Props) {
  if (scenario.content.kind !== "email") return null;
  const { content, clues, decoys } = scenario;
  const region = (name: string, children: React.ReactNode) => (
    <SelectableRegion region={name} clues={clues} decoys={decoys} selectedClueIds={selectedClueIds} interactive={interactive} onToggle={onToggle}>
      {children}
    </SelectableRegion>
  );

  return (
    <article className="email-card" aria-label="Fictional email simulation">
      <div className="simulation-label">Fictional simulation · links are inactive</div>
      <header className="email-header">
        {region("sender", <><strong>{content.displayName}</strong><span>{content.sender}</span></>)}
        {region("recipient", <div className="email-meta"><span>To</span> {content.recipient}</div>)}
        {region("subject", <><span className="meta-label">Subject</span><strong>{content.subject}</strong></>)}
      </header>
      <div className="email-body">
        {region("greeting", <p>{content.greeting}</p>)}
        {content.paragraphs.map((paragraph, index) => (
          <div key={paragraph}>{region(`paragraph-${index}`, <p>{paragraph}</p>)}</div>
        ))}
        {region("action", <div className="fake-action"><strong>{content.actionLabel}</strong><code>{content.actionUrl}</code></div>)}
        {region("signoff", <p className="signoff">{content.signoff}</p>)}
      </div>
    </article>
  );
}
