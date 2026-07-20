import type { Scenario } from "../types/scenario";

type Props = {
  scenario: Scenario;
  selectedClueIds: string[];
  interactive: boolean;
  onToggle: (clueId: string) => void;
};

export function EmailScenario({ scenario, selectedClueIds, interactive, onToggle }: Props) {
  const clueFor = (region: string) => scenario.clues.find((clue) => clue.selectableRegion === region);
  const selectable = (region: string, children: React.ReactNode) => {
    const clue = clueFor(region);
    if (!clue || !interactive) return <div className="message-region">{children}</div>;
    const pressed = selectedClueIds.includes(clue.id);
    return (
      <button
        type="button"
        className="message-region clue-button"
        aria-pressed={pressed}
        aria-label={`${clue.label}${pressed ? ", selected as suspicious" : ", select as suspicious"}`}
        onClick={() => onToggle(clue.id)}
      >
        {children}<span className="selection-mark" aria-hidden="true">{pressed ? "✓ Flagged" : "Inspect"}</span>
      </button>
    );
  };

  const { content } = scenario;
  return (
    <article className="email-card" aria-label="Fictional email simulation">
      <div className="simulation-label">Fictional simulation · links are inactive</div>
      <header className="email-header">
        {selectable("sender", <><strong>{content.displayName}</strong><span>{content.sender}</span></>)}
        <div className="email-meta"><span>To</span> {content.recipient}</div>
        {selectable("subject", <><span className="meta-label">Subject</span><strong>{content.subject}</strong></>)}
      </header>
      <div className="email-body">
        {selectable("greeting", <p>{content.greeting}</p>)}
        {content.paragraphs.map((paragraph, index) => (
          <div key={paragraph}>{selectable(`paragraph-${index}`, <p>{paragraph}</p>)}</div>
        ))}
        {selectable("action", <div className="fake-action"><strong>{content.actionLabel}</strong><code>{content.actionUrl}</code></div>)}
        <p className="signoff">{content.signoff}</p>
      </div>
    </article>
  );
}
