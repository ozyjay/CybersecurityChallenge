import type { Scenario } from "../types/scenario";
import { CipherScenario } from "./CipherScenario";
import { EmailScenario } from "./EmailScenario";
import { LoginScenario } from "./LoginScenario";
import { MessageScenario } from "./MessageScenario";
import { QrPosterScenario } from "./QrPosterScenario";

type Props = {
  scenario: Scenario;
  selectedClueIds: string[];
  cipherShift: number;
  cipherWordIndex: number;
  cipherDraft: string;
  cipherKeyword: string;
  interactive: boolean;
  onToggle: (clueId: string) => void;
  onCipherShiftChange: (shift: number) => void;
  onCipherLetter: (letter: string) => void;
  onCipherBackspace: () => void;
  onCipherKeyword: (keyword: string) => void;
};

export function ScenarioDisplay(props: Props) {
  const { scenario, selectedClueIds, interactive, onToggle } = props;
  if (scenario.activity === "cipher") {
    return <CipherScenario scenario={scenario} shift={props.cipherShift} wordIndex={props.cipherWordIndex} draft={props.cipherDraft} keyword={props.cipherKeyword} interactive={interactive} onShiftChange={props.onCipherShiftChange} onLetter={props.onCipherLetter} onBackspace={props.onCipherBackspace} onKeyword={props.onCipherKeyword} />;
  }
  const investigationProps = { scenario, selectedClueIds, interactive, onToggle };
  switch (scenario.content.kind) {
    case "email": return <EmailScenario {...investigationProps} />;
    case "message": return <MessageScenario {...investigationProps} />;
    case "qr": return <QrPosterScenario {...investigationProps} />;
    case "login": return <LoginScenario {...investigationProps} />;
  }
}
