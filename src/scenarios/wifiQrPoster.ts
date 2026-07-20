import type { Scenario } from "../types/scenario";

export const wifiQrPoster = {
  id: "premium-wifi-qr",
  title: "Premium campus Wi-Fi poster",
  category: "qr",
  difficulty: "starter",
  introduction: "Inspect this fictional poster. Select every detail that deserves a closer look.",
  content: {
    kind: "qr",
    organisation: "EXAMPLE CAMPUS CONNECT+",
    headline: "Tired of slow campus Wi-Fi?",
    offer: "Unlock PREMIUM speeds in 60 seconds — free today only!",
    scanLabel: "Scan now for instant access",
    displayedUrl: "http://wifi-access.example.org/setup",
    installationRequest: "Install the CampusBoost profile and new network certificate to continue.",
    permissions: ["Manage network settings", "Trust a new certificate", "View device details"],
    supportText: "Need help? Ask the promoter near this poster."
  },
  clues: [
    {
      id: "unofficial-branding",
      label: "Unofficial branding",
      explanation: "The poster uses generic campus language and unfamiliar branding rather than a clearly verified service identity.",
      severity: "medium",
      selectableRegion: "organisation"
    },
    {
      id: "premium-pressure",
      label: "Limited-time premium offer",
      explanation: "A free, urgent upgrade creates pressure to scan before checking whether the service is authorised.",
      severity: "medium",
      selectableRegion: "offer"
    },
    {
      id: "unfamiliar-wifi-domain",
      label: "Unfamiliar setup address",
      explanation: "The fictional setup address is not presented as an official campus support destination and uses insecure-looking HTTP text.",
      severity: "high",
      selectableRegion: "qr"
    },
    {
      id: "profile-installation",
      label: "Profile and certificate installation",
      explanation: "Installing a configuration profile or trusting a certificate can give a service significant control over network traffic.",
      severity: "high",
      selectableRegion: "installation"
    },
    {
      id: "excessive-permissions",
      label: "Excessive permissions",
      explanation: "The requested permissions go beyond simply joining a Wi-Fi network and should be verified with official support.",
      severity: "high",
      selectableRegion: "permissions"
    },
    {
      id: "missing-support",
      label: "No official support details",
      explanation: "The poster gives no official service desk, documentation, or independently verifiable support channel.",
      severity: "medium",
      selectableRegion: "support"
    }
  ],
  correctDecision: "escalate",
  takeaway: "Use the officially documented network setup and check with support before installing profiles or certificates.",
  careerConnection: "Network security specialists design trusted access systems and investigate unsafe connection instructions."
} satisfies Scenario;
