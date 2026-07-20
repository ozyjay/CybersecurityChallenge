import type { Scenario } from "../types/scenario";
import { SelectableRegion } from "./SelectableRegion";

type Props = { scenario: Scenario; selectedClueIds: string[]; interactive: boolean; onToggle: (clueId: string) => void };

export function QrPosterScenario({ scenario, selectedClueIds, interactive, onToggle }: Props) {
  if (scenario.content.kind !== "qr") return null;
  const { content, clues } = scenario;
  const region = (name: string, children: React.ReactNode, className = "") => (
    <SelectableRegion region={name} clues={clues} selectedClueIds={selectedClueIds} interactive={interactive} onToggle={onToggle} className={className}>
      {children}
    </SelectableRegion>
  );
  return (
    <article className="poster-card" aria-label="Fictional campus Wi-Fi poster">
      <div className="simulation-label">Fictional poster · QR pattern is inert</div>
      {region("organisation", <strong className="poster-brand">{content.organisation}</strong>)}
      <h2>{content.headline}</h2>
      {region("offer", <p className="poster-offer">{content.offer}</p>)}
      {region("qr", <div className="qr-area"><div className="fake-qr" role="img" aria-label="Inert decorative QR-style pattern"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><strong>{content.scanLabel}</strong><code>{content.displayedUrl}</code></div>, "poster-centred")}
      {region("installation", <p>{content.installationRequest}</p>)}
      {region("permissions", <div><strong>Requested access</strong><ul>{content.permissions.map((permission) => <li key={permission}>{permission}</li>)}</ul></div>)}
      {region("support", <small>{content.supportText}</small>)}
    </article>
  );
}
