import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("visitor journey", () => {
  it("completes the scenario and resets without retaining visitor state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /tap to begin/i }));
    const sender = screen.getByRole("button", { name: /sender name and address/i });
    await user.click(sender);
    expect(sender).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: /make my decision/i }));
    await user.click(screen.getByRole("button", { name: /report or escalate/i }));
    expect(screen.getByRole("heading", { name: /what the message was hiding/i })).toBeInTheDocument();
    expect(screen.getByText(/you found this/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /see my result/i }));
    expect(screen.getByText(/out of 80 points/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /reset for next visitor/i }));
    expect(screen.getByRole("button", { name: /tap to begin/i })).toBeInTheDocument();
  });

  it("offers keyboard-operable native controls", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: /tap to begin/i })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: /urgent account warning/i })).toBeInTheDocument();
  });
});
