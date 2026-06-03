import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GameSetupPanel } from "@/components/game/game-setup-panel";

describe("game setup panel", () => {
  it("starts a local two-player game by default", () => {
    const onStart = vi.fn();

    render(
      <GameSetupPanel
        title="New Game"
        description="Choose your match."
        onStart={onStart}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /start game/i }));

    expect(onStart).toHaveBeenCalledWith("local", "medium");
    expect(screen.queryByText("CPU Difficulty")).not.toBeInTheDocument();
  });

  it("shows CPU controls and starts with the selected difficulty", () => {
    const onStart = vi.fn();

    render(
      <GameSetupPanel
        title="New Game"
        description="Choose your match."
        onStart={onStart}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /vs cpu/i }));
    fireEvent.click(screen.getByRole("button", { name: "Hard" }));
    fireEvent.click(screen.getByRole("button", { name: /start game/i }));

    expect(screen.getByText("CPU Difficulty")).toBeInTheDocument();
    expect(onStart).toHaveBeenCalledWith("cpu", "hard");
  });

  it("renders the back-home guidance when requested", () => {
    render(
      <GameSetupPanel
        title="New Game"
        description="Choose your match."
        onStart={() => {}}
        showBackHome
      />,
    );

    expect(
      screen.getByText(
        /use local 2 player for pass-and-play or vs cpu for solo practice/i,
      ),
    ).toBeInTheDocument();
  });
});
