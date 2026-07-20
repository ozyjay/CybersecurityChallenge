import type { Scenario } from "../types/scenario";
import { SelectableRegion } from "./SelectableRegion";

type Props = { scenario: Scenario; selectedClueIds: string[]; interactive: boolean; onToggle: (clueId: string) => void };

export function MessageScenario({ scenario, selectedClueIds, interactive, onToggle }: Props) {
  if (scenario.content.kind !== "message") return null;
  const { content, clues, decoys } = scenario;
  const region = (name: string, children: React.ReactNode) => (
    <SelectableRegion region={name} clues={clues} decoys={decoys} selectedClueIds={selectedClueIds} interactive={interactive} onToggle={onToggle}>{children}</SelectableRegion>
  );
  return (
    <article className="message-card" aria-label="Fictional internship direct message">
      <div className="simulation-label">Fictional direct message · no reply function</div>
      <header className="message-app-header"><span className="avatar" aria-hidden="true">M</span>{region("sender", <div><strong>{content.sender}</strong><small>{content.channelLabel} · {content.receivedAt}</small></div>)}</header>
      <div className="chat-bubble">
        {region("heading", <h2>{content.heading}</h2>)}
        {content.paragraphs.map((paragraph, index) => <div key={paragraph}>{region(`paragraph-${index}`, <p>{paragraph}</p>)}</div>)}
        {region("pay", <p><strong>Pay:</strong> {content.payOffer}</p>)}
        {region("deadline", <p><strong>Response deadline:</strong> {content.deadline}</p>)}
        {region("platform", <p><strong>Next step:</strong> {content.platformRequest}</p>)}
        {region("payment", <p><strong>Equipment:</strong> {content.paymentRequest}</p>)}
        {region("company", <small>{content.companyDetails}</small>)}
      </div>
    </article>
  );
}
