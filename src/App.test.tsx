import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { scenarios } from "./scenarios";

describe("visitor journeys", () => {
  it.each(scenarios)("completes and resets $id", async (scenario) => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: new RegExp(scenario.title, "i") }));

    const clue = scenario.clues[0];
    const clueButton = screen.getByRole("button", { name: new RegExp(clue.label, "i") });
    await user.click(clueButton);
    expect(clueButton).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /make my decision/i }));
    await user.click(screen.getByRole("button", { name: /report or escalate/i }));
    expect(screen.getByRole("heading", { name: /what the scenario was hiding/i })).toBeInTheDocument();
    expect(screen.getByText(/you found this/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /see my result/i }));
    expect(screen.getByText(new RegExp(`out of ${scenario.clues.length * 10 + 20} points`, "i"))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /choose the next case/i }));
    expect(screen.getByRole("heading", { name: /can you spot the warning signs/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /play this case/i })).toHaveLength(4);
  });

  it("offers keyboard-operable scenario and clue controls", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: /urgent account warning/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: /urgent account warning/i })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("link", { name: /can you spot the scam/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /reset for next visitor/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /sender name and address/i })).toHaveFocus();
  });

  it("returns to a clean case list when reset during an investigation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /premium campus wi-fi poster/i }));
    await user.click(screen.getByRole("button", { name: /unofficial branding/i }));
    await user.click(screen.getByRole("button", { name: /reset for next visitor/i }));
    expect(screen.getByRole("heading", { name: /can you spot the warning signs/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /premium campus wi-fi poster/i }));
    expect(screen.getByText("0", { selector: ".clue-counter strong" })).toBeInTheDocument();
  });
});
