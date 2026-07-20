import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { buildScenarioDeck, scenarios } from "./scenarios";

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

describe("visitor journeys", () => {
  it.each(scenarios)("completes curated variant $id", async (scenario) => {
    const user = userEvent.setup();
    render(<App seed={seedForVariant(scenario.id)} />);
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
    expect(screen.getByRole("heading", { name: /can you spot the warning signs/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /play this case/i })).toHaveLength(5);
    expect(screen.getByRole("button", { name: new RegExp(scenario.title, "i") })).not.toHaveAttribute("data-scenario-id", scenario.id);
  });

  it("explains a false positive in the safe scenario", async () => {
    const safeScenario = scenarios.find((scenario) => scenario.correctDecision === "safe")!;
    const user = userEvent.setup();
    render(<App seed={seedForVariant(safeScenario.id)} />);
    await user.click(screen.getByRole("button", { name: new RegExp(safeScenario.title, "i") }));
    await user.click(screen.getByRole("button", { name: new RegExp(safeScenario.decoys[0].label, "i") }));
    await user.click(screen.getByRole("button", { name: /make my decision/i }));
    await user.click(screen.getByRole("button", { name: /safe$/i }));
    expect(screen.getByText(/false positive/i)).toBeInTheDocument();
    expect(screen.getByText(/no designed warning signs/i)).toBeInTheDocument();
  });

  it("offers keyboard-operable scenario and evidence controls", async () => {
    const user = userEvent.setup();
    render(<App seed={42} />);
    const firstCase = screen.getAllByRole("button", { name: /play this case/i })[0];
    await user.tab();
    await user.tab();
    expect(firstCase).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /make my decision/i })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("link", { name: /can you spot the scam/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /reset for next visitor/i })).toHaveFocus();
    await user.tab();
    expect(screen.getAllByRole("button", { pressed: false })[0]).toHaveFocus();
  });

  it("returns to a newly prepared, clean case list after reset", async () => {
    const user = userEvent.setup();
    render(<App seed={17} />);
    await user.click(screen.getByRole("button", { name: /premium campus wi-fi poster/i }));
    await user.click(screen.getByRole("button", { name: /unofficial branding/i }));
    await user.click(screen.getByRole("button", { name: /reset for next visitor/i }));
    expect(screen.getByRole("heading", { name: /can you spot the warning signs/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /premium campus wi-fi poster/i }));
    expect(screen.getByText("0", { selector: ".clue-counter strong" })).toBeInTheDocument();
  });
});
