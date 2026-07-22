import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { buildScenarioDeck, scenarios } from "./scenarios";
import type { CipherScenario, InvestigationScenario } from "./types/scenario";

const decisionButton = {
  safe: /safe$/i,
  suspicious: /suspicious$/i,
  escalate: /report or escalate/i
} as const;

function seedForVariant(scenarioId: string): number {
  for (let seed = 0; seed < 1000; seed += 1) {
    if (buildScenarioDeck(seed).some((scenario) => scenario.id === scenarioId)) return seed;
  }
  throw new Error(`No deterministic seed found for ${scenarioId}`);
}

async function openCaseList(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /tap to begin/i }));
}

describe("visitor journeys", () => {
  const investigationScenarios = scenarios.filter((scenario): scenario is InvestigationScenario => scenario.activity === "investigation");
  const cipherScenarios = scenarios.filter((scenario): scenario is CipherScenario => scenario.activity === "cipher");

  it.each(investigationScenarios)("completes curated variant $id", async (scenario) => {
    const user = userEvent.setup();
    render(<App seed={seedForVariant(scenario.id)} />);
    await openCaseList(user);
    await user.click(screen.getByRole("button", { name: new RegExp(scenario.title, "i") }));

    if (scenario.clues[0]) {
      const clue = scenario.clues[0];
      const clueButton = screen.getByRole("button", { name: new RegExp(clue.label, "i") });
      await user.click(clueButton);
      expect(clueButton).toHaveAttribute("aria-pressed", "true");
    }

    await user.click(screen.getByRole("button", { name: /make my decision/i }));
    await user.click(screen.getByRole("button", { name: decisionButton[scenario.correctDecision] }));
    expect(screen.getByRole("heading", { name: /what the scenario was hiding/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /see my result/i }));
    expect(screen.getByText(new RegExp(`out of ${scenario.clues.length * 10 + 20} points`, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset for next visitor/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /choose the next case/i }));
    expect(screen.getByRole("heading", { name: /which case will you inspect/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /play this case/i })).toHaveLength(9);
    expect(screen.getByRole("button", { name: new RegExp(scenario.title, "i") })).not.toHaveAttribute("data-scenario-id", scenario.id);
  });

  it("explains a false positive in the safe scenario", async () => {
    const safeScenario = investigationScenarios.find((scenario) => scenario.correctDecision === "safe")!;
    const user = userEvent.setup();
    render(<App seed={seedForVariant(safeScenario.id)} />);
    await openCaseList(user);
    await user.click(screen.getByRole("button", { name: new RegExp(safeScenario.title, "i") }));
    await user.click(screen.getByRole("button", { name: new RegExp(safeScenario.decoys[0].label, "i") }));
    await user.click(screen.getByRole("button", { name: /make my decision/i }));
    await user.click(screen.getByRole("button", { name: /safe$/i }));
    expect(screen.getByText(/false positive/i)).toBeInTheDocument();
    expect(screen.getByText(/no designed warning signs/i)).toBeInTheDocument();
  });

  it.each(cipherScenarios)("decodes curated cipher variant $id", async (scenario) => {
    const user = userEvent.setup();
    render(<App seed={seedForVariant(scenario.id)} />);
    await openCaseList(user);
    await user.click(screen.getByRole("button", { name: new RegExp(scenario.title, "i") }));

    await user.click(screen.getByRole("button", { name: /lock in word/i }));
    expect(screen.getByText(/not readable yet/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /show hint 1/i }));
    expect(screen.getByText(scenario.content.hints[0])).toBeInTheDocument();
    const decoder = within(screen.getByLabelText(new RegExp(`${scenario.content.cipherType} cipher decoder`, "i")));
    if (scenario.content.cipherType === "caesar") {
      for (let step = 0; step < scenario.content.shift; step += 1) await user.click(decoder.getByRole("button", { name: /next shift/i }));
    } else if (scenario.content.cipherType === "vigenere") {
      await user.click(decoder.getByRole("button", { name: scenario.content.keyword }));
    }
    if (scenario.content.cipherType === "caesar" || scenario.content.cipherType === "vigenere") {
      expect(screen.getByText(scenario.content.plaintext.split(" ")[0], { selector: ".decoded-text" })).toBeInTheDocument();
    }
    const plaintextWords = scenario.content.plaintext.split(" ");
    const cipherWords = scenario.content.ciphertext.split(" ");
    for (const [wordIndex, word] of plaintextWords.entries()) {
      if (scenario.content.cipherType === "atbash") {
        for (const letter of word) await user.click(decoder.getByRole("button", { name: letter }));
      } else if (scenario.content.cipherType === "polybius") {
        for (const pair of cipherWords[wordIndex].split("-")) await user.click(decoder.getByRole("button", { name: new RegExp(`^${pair},`) }));
      }
      await user.click(screen.getByRole("button", { name: /lock in word/i }));
    }
    expect(screen.getByRole("heading", { name: /message decoded/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /see my result/i }));
    expect(screen.getByText(/out of 100 points/i)).toBeInTheDocument();
    expect(screen.getByText("85", { selector: ".score strong" })).toBeInTheDocument();
  });

  it("offers keyboard-operable scenario and evidence controls", async () => {
    const user = userEvent.setup();
    render(<App seed={42} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: /staff/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /tap to begin/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("link", { name: /can you spot the scam/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /reset for next visitor/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /staff/i })).toHaveFocus();
    await user.tab();
    const firstCase = screen.getAllByRole("button", { name: /play this case/i })[0];
    expect(firstCase).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("link", { name: /can you spot the scam/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /reset for next visitor/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /staff/i })).toHaveFocus();
    await user.tab();
    expect(screen.getAllByRole("button", { pressed: false })[0]).toHaveFocus();
  });

  it("returns to a newly prepared, clean case list after reset", async () => {
    const user = userEvent.setup();
    render(<App seed={17} />);
    await openCaseList(user);
    await user.click(screen.getByRole("button", { name: /premium campus wi-fi poster/i }));
    await user.click(screen.getByRole("button", { name: /unofficial branding/i }));
    await user.click(screen.getByRole("button", { name: /reset for next visitor/i }));
    expect(screen.getByRole("heading", { name: /can you spot the warning signs/i })).toBeInTheDocument();
    await openCaseList(user);
    await user.click(screen.getByRole("button", { name: /premium campus wi-fi poster/i }));
    expect(screen.getByText("0", { selector: ".clue-counter strong" })).toBeInTheDocument();
  });
});
