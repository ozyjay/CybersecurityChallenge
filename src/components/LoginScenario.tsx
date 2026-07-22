import type { InvestigationScenario } from "../types/scenario";
import { SelectableRegion } from "./SelectableRegion";

type Props = { scenario: InvestigationScenario; selectedClueIds: string[]; interactive: boolean; onToggle: (clueId: string) => void };

export function LoginScenario({ scenario, selectedClueIds, interactive, onToggle }: Props) {
  if (scenario.content.kind !== "login") return null;
  const { content, clues, decoys } = scenario;
  const region = (name: string, children: React.ReactNode) => (
    <SelectableRegion region={name} clues={clues} decoys={decoys} selectedClueIds={selectedClueIds} interactive={interactive} onToggle={onToggle}>{children}</SelectableRegion>
  );
  return (
    <article className="login-browser" aria-label="Fictional shared document sign-in page">
      <div className="simulation-label">Fictional page · sign-in is disabled</div>
      <div className="browser-bar" aria-label="Displayed page address">{region("url", <code>{content.pageUrl}</code>)}</div>
      <div className="login-page">
        {region("brand", <strong className="login-brand">{content.serviceName}</strong>)}
        <div className="login-panel">
          {region("document", <span className="login-title">{content.documentTitle}</span>)}
          {region("sender", <p>{content.sharedBy}</p>)}
          {region("context", <p>{content.context}</p>)}
          {region("credentials", <div className="credential-preview"><p>{content.credentialPrompt}</p><div className="disabled-field">Organisation email — entry disabled</div><div className="disabled-field">Password — entry disabled</div><span className="disabled-submit">{content.actionLabel}</span></div>)}
          {region("support", <small>{content.supportText}</small>)}
        </div>
      </div>
    </article>
  );
}
