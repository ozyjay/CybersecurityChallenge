import type { ScenarioFamily } from "../types/scenario";

export const internshipOffer = {
  id: "instant-internship-offer",
  activity: "investigation",
  title: "Instant remote internship",
  category: "sms",
  difficulty: "intermediate",
  introduction: "Inspect this fictional direct message. Flag the details that make the offer hard to trust.",
  content: {
    kind: "message",
    channelLabel: "Direct message · New contact",
    sender: "Morgan · BrightPath Talent",
    receivedAt: "Today, 10:42",
    heading: "Congratulations! You have been selected",
    paragraphs: [
      "Your profile was recommended for a fully remote cyber internship. No interview is needed and your place is already approved."
    ],
    payOffer: "The role pays $1,800 per week.",
    deadline: "Reply within 20 minutes or we will offer it to another student.",
    platformRequest: "Continue with our hiring manager on QuickChatter using code BP-FAST.",
    paymentRequest: "Purchase a $650 equipment voucher first. Your full reimbursement will arrive with your first pay.",
    companyDetails: "BrightPath Talent Group · careers.example.com says ‘Bright Path Student Services’"
  },
  clues: [
    {
      id: "unsolicited-offer",
      label: "Unsolicited instant acceptance",
      explanation: "A job offered without an application, interview, or role-specific discussion is difficult to verify.",
      severity: "high",
      selectableRegion: "paragraph-0"
    },
    {
      id: "unrealistic-pay",
      label: "Unusually high pay",
      explanation: "An exceptional salary paired with instant acceptance is designed to make the offer feel too valuable to question.",
      severity: "medium",
      selectableRegion: "pay"
    },
    {
      id: "response-pressure",
      label: "Twenty-minute deadline",
      explanation: "A very short deadline discourages independent research and advice from someone you trust.",
      severity: "high",
      selectableRegion: "deadline"
    },
    {
      id: "unusual-platform",
      label: "Move to another platform",
      explanation: "Moving an unexpected recruitment conversation away from a verifiable channel reduces accountability.",
      severity: "medium",
      selectableRegion: "platform"
    },
    {
      id: "upfront-payment",
      label: "Upfront equipment payment",
      explanation: "A request to pay before starting work is a major warning sign, even when reimbursement is promised.",
      severity: "high",
      selectableRegion: "payment"
    },
    {
      id: "inconsistent-company",
      label: "Inconsistent company details",
      explanation: "The sender, organisation name, and fictional website description do not agree with one another.",
      severity: "medium",
      selectableRegion: "company"
    }
  ],
  decoys: [
    {
      id: "message-timestamp",
      label: "Message header and time",
      explanation: "A sender label and ordinary timestamp are not warning signs on their own; both can appear in legitimate and deceptive messages.",
      selectableRegion: "sender"
    }
  ],
  correctDecision: "escalate",
  takeaway: "Verify opportunities through an organisation’s independently found careers page and never pay to secure a job.",
  careerConnection: "Fraud and threat-intelligence analysts connect inconsistent identities, payment patterns, and reports to protect job seekers.",
  variants: [
    {
      id: "graduate-research-role",
      content: {
        kind: "message",
        channelLabel: "Direct message · First conversation",
        sender: "Casey · Horizon Works Recruitment",
        receivedAt: "Today, 14:08",
        heading: "Exclusive graduate research role approved",
        paragraphs: [
          "A partner selected your public profile for a remote security research role. Your application and interview have been waived."
        ],
        payOffer: "Earn $2,100 each week.",
        deadline: "Confirm in the next 15 minutes so payroll can reserve your position.",
        platformRequest: "Contact the coordinator through ChatSprint with invitation HW-NOW.",
        paymentRequest: "Transfer $720 for your secure workstation kit. It will be reimbursed after orientation.",
        companyDetails: "Horizon Works Recruitment · jobs.example.net lists ‘Horizon Student Projects’"
      }
    }
  ]
} satisfies ScenarioFamily;
