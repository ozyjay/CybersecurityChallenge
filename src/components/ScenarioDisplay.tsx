import type { Scenario } from "../types/scenario";
import { EmailScenario } from "./EmailScenario";
import { LoginScenario } from "./LoginScenario";
import { MessageScenario } from "./MessageScenario";
import { QrPosterScenario } from "./QrPosterScenario";

type Props = { scenario: Scenario; selectedClueIds: string[]; interactive: boolean; onToggle: (clueId: string) => void };

export function ScenarioDisplay(props: Props) {
  switch (props.scenario.content.kind) {
    case "email": return <EmailScenario {...props} />;
    case "message": return <MessageScenario {...props} />;
    case "qr": return <QrPosterScenario {...props} />;
    case "login": return <LoginScenario {...props} />;
  }
}
