import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScoreBurstOverlay } from "@/components/game/score-burst-overlay";
import { useGame } from "@/context/game-context";

vi.mock("@/context/game-context", () => ({
  useGame: vi.fn(),
}));

const mockedUseGame = vi.mocked(useGame);

describe("score burst overlay", () => {
  it("stays hidden when there is no score celebration", () => {
    mockedUseGame.mockReturnValue({
      isScoreCelebrationActive: false,
      scoreCelebration: null,
    } as ReturnType<typeof useGame>);

    const { container } = render(<ScoreBurstOverlay />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the centered points celebration when a score is present", () => {
    mockedUseGame.mockReturnValue({
      isScoreCelebrationActive: true,
      scoreCelebration: {
        id: "log-12",
        playerId: "player-1",
        action: "play",
        points: 32,
      },
    } as ReturnType<typeof useGame>);

    render(<ScoreBurstOverlay />);

    expect(screen.getByText("+32")).toBeInTheDocument();
    expect(screen.getByText("points")).toBeInTheDocument();
  });

  it("reuses the burst for a swap action", () => {
    mockedUseGame.mockReturnValue({
      isScoreCelebrationActive: true,
      scoreCelebration: {
        id: "log-13",
        playerId: "player-1",
        action: "trade",
      },
    } as ReturnType<typeof useGame>);

    render(<ScoreBurstOverlay />);

    expect(screen.getByText("Swap")).toBeInTheDocument();
    expect(screen.getByText("turn")).toBeInTheDocument();
  });
});
