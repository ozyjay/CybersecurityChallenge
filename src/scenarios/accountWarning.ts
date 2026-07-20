import type { Scenario } from "../types/scenario";

export const accountWarning: Scenario = {
  id: "urgent-account-warning",
  title: "Urgent account warning",
  category: "email",
  difficulty: "starter",
  introduction: "Inspect this fictional email. Select every detail that makes you suspicious.",
  content: {
    kind: "email",
    displayName: "Example University IT Helpdesk",
    sender: "security-team@accounts.example.net",
    recipient: "University member",
    subject: "FINAL WARNING: Account deletion in 30 minutes",
    greeting: "Dear account holder,",
    paragraphs: [
      "We detected a problem with your university account. It will be permanently deleted in 30 minutes unless you verify it now.",
      "Confirm your password and verification details using the secure portal below. Failure to act immediately cannot be reversed."
    ],
    actionLabel: "Keep my account",
    actionUrl: "http://uni-verify.example.net/login",
    signoff: "Account Security Team"
  },
  clues: [
    {
      id: "sender-mismatch",
      label: "Sender name and address",
      explanation: "The display name claims to be a university helpdesk, but the address uses an unrelated fictional domain.",
      severity: "high",
      selectableRegion: "sender"
    },
    {
      id: "urgent-subject",
      label: "Urgent subject line",
      explanation: "A short, irreversible deadline pressures the reader to act before checking the message.",
      severity: "medium",
      selectableRegion: "subject"
    },
    {
      id: "generic-greeting",
      label: "Generic greeting",
      explanation: "The message does not identify the recipient or provide useful account context.",
      severity: "low",
      selectableRegion: "greeting"
    },
    {
      id: "artificial-urgency",
      label: "Threat and urgency",
      explanation: "Threatening permanent deletion is designed to override careful verification.",
      severity: "high",
      selectableRegion: "paragraph-0"
    },
    {
      id: "credential-request",
      label: "Password request",
      explanation: "A legitimate support team should not ask you to confirm a password through an emailed link.",
      severity: "high",
      selectableRegion: "paragraph-1"
    },
    {
      id: "suspicious-link",
      label: "Unusual login address",
      explanation: "The displayed address is not an official service and uses an insecure-looking HTTP URL. It is shown only as inert text.",
      severity: "high",
      selectableRegion: "action"
    }
  ],
  correctDecision: "escalate",
  takeaway: "Pause, verify the sender through an official channel, and report unexpected account warnings.",
  careerConnection: "Security analysts investigate reports like this and help organisations improve filters, warnings, and response processes."
};
