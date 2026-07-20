import type { Scenario } from "../types/scenario";

export const sharedDocumentLogin = {
  id: "shared-document-login",
  title: "Shared document sign-in",
  category: "login",
  difficulty: "intermediate",
  introduction: "Inspect this fictional sign-in page. Select the details you would verify before proceeding.",
  content: {
    kind: "login",
    serviceName: "CloudDock Documents",
    pageUrl: "http://cloudd0ck-share.example.com/open",
    documentTitle: "A document is waiting for you",
    sharedBy: "Shared by: External document user",
    context: "The sender has not included an organisation, project, message, or reason you should expect this file.",
    credentialPrompt: "Sign in with your organisation email and password to view this shared document.",
    actionLabel: "Continue to organisation sign-in",
    supportText: "CloudDoc Secure Sharing · Help information unavailable"
  },
  clues: [
    {
      id: "misspelled-domain",
      label: "Misspelled address",
      explanation: "The fictional address substitutes a zero in the service name and does not establish an official destination.",
      severity: "high",
      selectableRegion: "url"
    },
    {
      id: "inconsistent-branding",
      label: "Inconsistent service branding",
      explanation: "The page uses different versions of the service name, which suggests a copied or poorly constructed sign-in page.",
      severity: "medium",
      selectableRegion: "brand"
    },
    {
      id: "vague-sender",
      label: "Vague document sender",
      explanation: "The page does not identify a person or organisation that can be independently contacted.",
      severity: "medium",
      selectableRegion: "sender"
    },
    {
      id: "missing-context",
      label: "Missing organisational context",
      explanation: "There is no project, team, or message explaining why this document should be expected.",
      severity: "medium",
      selectableRegion: "context"
    },
    {
      id: "credential-request",
      label: "Unnecessary credential request",
      explanation: "An unexpected document page should not be trusted with organisation credentials; open the official service separately instead.",
      severity: "high",
      selectableRegion: "credentials"
    },
    {
      id: "missing-help",
      label: "Unavailable help information",
      explanation: "Missing support and inconsistent footer branding provide no reliable way to verify the page.",
      severity: "low",
      selectableRegion: "support"
    }
  ],
  correctDecision: "escalate",
  takeaway: "Open the known official document service yourself and confirm unexpected shares with the sender through another channel.",
  careerConnection: "Identity and access specialists design safer sign-in journeys and reduce opportunities for credential theft."
} satisfies Scenario;
