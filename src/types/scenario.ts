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

export type MessageContent = {
  kind: "message";
  channelLabel: string;
  sender: string;
  receivedAt: string;
  heading: string;
  paragraphs: string[];
  platformRequest: string;
  paymentRequest: string;
  companyDetails: string;
};

export type QrPosterContent = {
  kind: "qr";
  organisation: string;
  headline: string;
  offer: string;
  scanLabel: string;
  displayedUrl: string;
  installationRequest: string;
  permissions: string[];
  supportText: string;
};

export type LoginContent = {
  kind: "login";
  serviceName: string;
  pageUrl: string;
  documentTitle: string;
  sharedBy: string;
  context: string;
  credentialPrompt: string;
  actionLabel: string;
  supportText: string;
};

export type ScenarioContent = EmailContent | MessageContent | QrPosterContent | LoginContent;

export type Scenario = {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty: Difficulty;
  introduction: string;
  content: ScenarioContent;
  clues: Clue[];
  correctDecision: Decision;
  takeaway: string;
  careerConnection: string;
};
