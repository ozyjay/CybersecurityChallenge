import type { ScenarioFamily } from "../types/scenario";

export const expectedNotification = {
  id: "expected-service-notification",
  activity: "investigation",
  title: "Expected service notification",
  category: "email",
  difficulty: "intermediate",
  introduction: "Not every message is a scam. Inspect this fictional email and decide whether its details fit an expected, verifiable notification.",
  content: {
    kind: "email",
    displayName: "Example Learning Portal",
    sender: "notifications@learning.example.org",
    recipient: "University member",
    subject: "Your requested assignment receipt is ready",
    greeting: "Hello,",
    paragraphs: [
      "This confirms that your assignment upload was received at the time shown in the learning portal.",
      "You can view the receipt by opening the learning portal from your usual bookmark. No password or reply is requested in this message."
    ],
    actionLabel: "Displayed reference only — open your usual bookmark",
    actionUrl: "https://learning.example.org/receipts",
    signoff: "Example Learning Portal Notifications"
  },
  clues: [],
  decoys: [
    { id: "safe-sender", label: "Consistent sender", explanation: "The fictional display name and reserved service domain are consistent, though an address alone never proves authenticity.", selectableRegion: "sender" },
    { id: "safe-recipient", label: "Ordinary recipient line", explanation: "The recipient line is normal context and does not create pressure or request personal information.", selectableRegion: "recipient" },
    { id: "safe-subject", label: "Expected subject", explanation: "The subject describes an action the visitor is assumed to have requested and makes no urgent threat.", selectableRegion: "subject" },
    { id: "safe-greeting", label: "Neutral greeting", explanation: "A neutral greeting is not proof either way, but there are no accompanying pressure tactics here.", selectableRegion: "greeting" },
    { id: "safe-confirmation", label: "Confirmation message", explanation: "The message confirms an expected action and does not ask the reader to do something risky.", selectableRegion: "paragraph-0" },
    { id: "safe-navigation", label: "Independent navigation advice", explanation: "Directing the reader to a familiar route supports independent verification instead of demanding an emailed-link sign-in.", selectableRegion: "paragraph-1" },
    { id: "safe-reference", label: "Inert service reference", explanation: "The address is displayed as inactive reference text and the message recommends navigating independently instead.", selectableRegion: "action" },
    { id: "safe-signoff", label: "Consistent notification sign-off", explanation: "The sign-off matches the fictional service identity, while remaining only one part of the overall assessment.", selectableRegion: "signoff" }
  ],
  correctDecision: "safe",
  takeaway: "Assess the whole context: an expected message with no pressure or credential request can be reasonable, but use a known route to verify it.",
  careerConnection: "Security and user-experience teams design trustworthy notifications that help people verify actions without creating risky habits.",
  variants: [
    {
      id: "event-registration",
      content: {
        kind: "email",
        displayName: "Example Events Desk",
        sender: "confirmations@events.example.com",
        recipient: "Registered attendee",
        subject: "Registration receipt for your requested campus tour",
        greeting: "Hello,",
        paragraphs: [
          "Your requested campus tour registration has been recorded. The date and accessibility details are available in the events portal.",
          "Open the events portal from the university information page when convenient. This confirmation does not ask for payment, credentials, or a reply."
        ],
        actionLabel: "Displayed reference only — use the information page",
        actionUrl: "https://events.example.com/registrations",
        signoff: "Example Events Desk"
      }
    }
  ]
} satisfies ScenarioFamily;
