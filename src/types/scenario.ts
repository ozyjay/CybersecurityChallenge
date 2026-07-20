export type ScenarioCategory = "email" | "sms" | "qr" | "login" | "permissions";
export type Difficulty = "starter" | "intermediate";
export type Decision = "safe" | "suspicious" | "escalate";
export type Severity = "low" | "medium" | "high";

export type Clue = {
  id: string;
  label: string;
  explanation: string;
  severity: Severity;
  selectableRegion: string;
};

export type EmailContent = {
  kind: "email";
  displayName: string;
  sender: string;
  recipient: string;
  subject: string;
  greeting: string;
  paragraphs: string[];
  actionLabel: string;
  actionUrl: string;
  signoff: string;
};

export type Scenario = {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: Difficulty;
  introduction: string;
  content: EmailContent;
  clues: Clue[];
  correctDecision: Decision;
  takeaway: string;
  careerConnection: string;
};
