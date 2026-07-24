import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => vi.useRealTimers());

async function openFirstCase(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /tap to begin/i }));
  await user.click(screen.getAllByRole("button", { name: /play this case/i })[0]);
}

function selectReplayScenario(title: RegExp) {
  const select = screen.getByRole("combobox", { name: /prepared scenario/i });
  const option = screen.getByRole("option", { name: title }) as HTMLOptionElement;
  fireEvent.change(select, { target: { value: option.value } });
}

function openStaffControls() {
  fireEvent.keyDown(window, { key: "s", ctrlKey: true, altKey: true });
}

async function advanceReplayStep(milliseconds: number) {
  await act(async () => vi.advanceTimersByTime(milliseconds));
}

describe("staff controls", () => {
  it("keeps the visitor-facing staff button disabled", async () => {
    const user = userEvent.setup();
    render(<App seed={5} />);
    const staffButton = screen.getByRole("button", { name: /staff controls unavailable/i });

    expect(staffButton).toBeDisabled();
    await user.click(staffButton);
    expect(screen.queryByRole("dialog", { name: /staff controls/i })).not.toBeInTheDocument();
  });

  it("opens with the keyboard shortcut and filters visitor difficulty", async () => {
    const user = userEvent.setup();
    render(<App seed={5} />);
    fireEvent.keyDown(window, { key: "s", ctrlKey: true, altKey: true });
    expect(screen.getByRole("dialog", { name: /staff controls/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /sound cues/i })).not.toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: /sound cues/i }));
    expect(screen.getByRole("checkbox", { name: /sound cues/i })).toBeChecked();
    await user.selectOptions(screen.getByLabelText(/difficulty/i), "starter");
    await user.click(screen.getByRole("button", { name: /close staff controls/i }));
    await user.click(screen.getByRole("button", { name: /tap to begin/i }));
    expect(screen.getAllByRole("button", { name: /play this case/i })).toHaveLength(5);
  });

  it("starts a selected case and returns to attract mode without terminal commands", async () => {
    const user = userEvent.setup();
    render(<App seed={9} />);
    fireEvent.keyDown(window, { key: "s", ctrlKey: true, altKey: true });
    await user.selectOptions(screen.getByRole("combobox", { name: /prepared scenario/i }), screen.getByRole("option", { name: /premium campus wi-fi poster/i }));
    await user.click(screen.getByRole("button", { name: /start selected case/i }));
    expect(screen.getByRole("heading", { name: /premium campus wi-fi poster/i })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "s", ctrlKey: true, altKey: true });
    await user.click(screen.getByRole("button", { name: /return to attract screen/i }));
    expect(screen.getByRole("button", { name: /tap to begin/i })).toBeInTheDocument();
  });
});

describe("optional timer", () => {
  it("moves to the decision when time expires", async () => {
    vi.useFakeTimers();
    render(<App seed={12} timerSeconds={2} />);
    fireEvent.click(screen.getByRole("button", { name: /tap to begin/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /play this case/i })[0]);
    expect(screen.getByRole("timer", { name: /2 seconds remaining/i })).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(1000));
    await act(async () => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { name: /time’s up/i })).toBeInTheDocument();
  });

  it("supports timer-off and relaxed modes", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App seed={12} timerSeconds={4} />);
    openStaffControls();
    await user.click(screen.getByRole("checkbox", { name: /timer enabled/i }));
    await user.click(screen.getByRole("button", { name: /close staff controls/i }));
    await openFirstCase(user);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByText(/timer off/i)).toBeInTheDocument();

    unmount();
    render(<App seed={12} timerSeconds={4} />);
    openStaffControls();
    await user.click(screen.getByRole("checkbox", { name: /relaxed 90-second timer/i }));
    await user.click(screen.getByRole("button", { name: /close staff controls/i }));
    await openFirstCase(user);
    expect(screen.getByRole("timer", { name: /8 seconds remaining/i })).toBeInTheDocument();
  });

  it("cancels the countdown during next-visitor reset", async () => {
    vi.useFakeTimers();
    render(<App seed={12} timerSeconds={2} />);
    fireEvent.click(screen.getByRole("button", { name: /tap to begin/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /play this case/i })[0]);
    await act(async () => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button", { name: /reset for next visitor/i }));
    await act(async () => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("button", { name: /tap to begin/i })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("lets a cipher visitor continue after time expires", async () => {
    vi.useFakeTimers();
    render(<App seed={12} timerSeconds={1} />);
    openStaffControls();
    selectReplayScenario(/decode the secret message/i);
    fireEvent.click(screen.getByRole("button", { name: /start selected case/i }));
    await act(async () => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { name: /time’s up — keep going/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next shift/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /lock in word/i })).toBeEnabled();
  });
});

describe("prepared replay", () => {
  it("runs the cipher-specific reveal and result path", async () => {
    vi.useFakeTimers();
    render(<App seed={21} replayStepMilliseconds={100} />);
    openStaffControls();
    selectReplayScenario(/decode the secret message/i);
    fireEvent.click(screen.getByRole("button", { name: /start prepared replay/i }));
    await advanceReplayStep(100);
    expect(screen.getByRole("heading", { name: /message decoded/i })).toBeInTheDocument();
    await advanceReplayStep(100);
    expect(screen.getByText(/out of 100 points/i)).toBeInTheDocument();
  });

  it("progresses through a deterministic example and loops to another case", async () => {
    vi.useFakeTimers();
    render(<App seed={21} replayStepMilliseconds={100} />);
    openStaffControls();
    selectReplayScenario(/urgent account warning/i);
    fireEvent.click(screen.getByRole("button", { name: /start prepared replay/i }));
    expect(screen.getByText(/automated local example/i)).toBeInTheDocument();

    await advanceReplayStep(100);
    expect(screen.getByText("3", { selector: ".clue-counter strong" })).toBeInTheDocument();
    await advanceReplayStep(100);
    await advanceReplayStep(100);
    expect(screen.getByRole("heading", { name: /what the scenario was hiding/i })).toBeInTheDocument();
    await advanceReplayStep(100);
    expect(screen.getByText(/prepared example using reviewed local content/i)).toBeInTheDocument();
    await advanceReplayStep(100);
    expect(screen.getByRole("button", { name: /tap to begin/i })).toBeInTheDocument();
    await advanceReplayStep(100);
    expect(screen.getByText(/automated local example/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /urgent account warning/i })).not.toBeInTheDocument();
  });

  it("returns to attract mode immediately on visitor input", async () => {
    vi.useFakeTimers();
    render(<App seed={21} replayStepMilliseconds={100} />);
    openStaffControls();
    selectReplayScenario(/urgent account warning/i);
    fireEvent.click(screen.getByRole("button", { name: /start prepared replay/i }));
    expect(screen.getByText(/automated local example/i)).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("button", { name: /tap to begin/i })).toBeInTheDocument();
    expect(screen.queryByText(/automated local example/i)).not.toBeInTheDocument();
  });

  it("can run once and return to attract mode", async () => {
    vi.useFakeTimers();
    render(<App seed={21} replayStepMilliseconds={50} />);
    openStaffControls();
    fireEvent.click(screen.getByRole("checkbox", { name: /loop automatically/i }));
    fireEvent.click(screen.getByRole("button", { name: /start prepared replay/i }));
    for (let step = 0; step < 6; step += 1) await advanceReplayStep(50);
    expect(screen.getByRole("button", { name: /tap to begin/i })).toBeInTheDocument();
    expect(screen.queryByText(/automated local example/i)).not.toBeInTheDocument();
  });
});
