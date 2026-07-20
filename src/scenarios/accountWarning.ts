import type { ScenarioFamily } from "../types/scenario";

export const accountWarning = {
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
  decoys: [
    {
      id: "named-recipient-format",
      label: "Recipient line",
      explanation: "A normal-looking recipient line is not evidence of safety or danger by itself. Focus on details you can independently verify.",
      selectableRegion: "recipient"
    },
    {
      id: "ordinary-signoff",
      label: "Plain sign-off",
      explanation: "A professional-sounding sign-off is easy to copy and is not, by itself, a warning sign.",
      selectableRegion: "signoff"
    }
  ],
  correctDecision: "escalate",
  takeaway: "Pause, verify the sender through an official channel, and report unexpected account warnings.",
  careerConnection: "Security analysts investigate reports like this and help organisations improve filters, warnings, and response processes.",
  variants: [
    {
      id: "storage-suspension",
      content: {
        kind: "email",
        displayName: "Example University Digital Services",
        sender: "account-review@support.example.org",
        recipient: "University member",
        subject: "Action required: Cloud storage suspended tonight",
        greeting: "Hello user,",
        paragraphs: [
          "Use the verification page below and confirm your password details now to keep access to your files.",
          "Your university cloud storage has exceeded a new security limit. Files will be removed tonight unless your account is revalidated."
        ],
        actionLabel: "Restore cloud access",
        actionUrl: "http://storage-check.example.org/verify",
        signoff: "Digital Services Review Team"
      },
      clues: [
        { id: "sender-mismatch", label: "Sender name and address", explanation: "The display name claims to be a university service, but the address uses an unrelated fictional domain.", severity: "high", selectableRegion: "sender" },
        { id: "urgent-subject", label: "Urgent subject line", explanation: "The subject announces suspension and pushes the reader towards immediate action.", severity: "medium", selectableRegion: "subject" },
        { id: "generic-greeting", label: "Generic greeting", explanation: "The message does not identify the recipient or provide useful account context.", severity: "low", selectableRegion: "greeting" },
        { id: "credential-request", label: "Password request", explanation: "A legitimate support team should not ask you to confirm a password through an emailed link.", severity: "high", selectableRegion: "paragraph-0" },
        { id: "artificial-urgency", label: "Threat and urgency", explanation: "Threatening permanent file removal is designed to override careful verification.", severity: "high", selectableRegion: "paragraph-1" },
        { id: "suspicious-link", label: "Unusual login address", explanation: "The displayed address is not an official service and uses insecure-looking HTTP text. It is shown only as inert text.", severity: "high", selectableRegion: "action" }
      ]
    }
  ]
} satisfies ScenarioFamily;
