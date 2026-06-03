import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider, useGame } from "@/context/game-context";
import { getCpuConfig, resolveCpuTurn } from "@/lib/scrabble/cpu";
import { passTurn, submitMove, tradeTiles } from "@/lib/scrabble/game";
import { GameState } from "@/types/game";

vi.mock("@/lib/scrabble/game", async () => {
  const actual = await vi.importActual<typeof import("@/lib/scrabble/game")>(
    "@/lib/scrabble/game",
  );

  return {
    ...actual,
    passTurn: vi.fn(actual.passTurn),
    submitMove: vi.fn(actual.submitMove),
    tradeTiles: vi.fn(actual.tradeTiles),
  };
});

vi.mock("@/lib/scrabble/cpu", async () => {
  const actual = await vi.importActual<typeof import("@/lib/scrabble/cpu")>(
    "@/lib/scrabble/cpu",
  );

  return {
    ...actual,
    resolveCpuTurn: vi.fn((state) => ({
      ...state,
      currentPlayerIndex: 1,
      turn: state.turn + 1,
    })),
  };
});

function CpuTurnHarness() {
  const {
    dictionary,
    isCpuTurnInProgress,
    startLocalGame,
    game,
    rackPlayer,
  } = useGame();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    startLocalGame({
      players: [
        { name: "CPU", kind: "computer", cpuConfig: getCpuConfig("easy") },
        { name: "Player 2", kind: "human-local" },
      ],
    });
  }, [startLocalGame]);

  return (
    <div>
      <div>{dictionary.ready ? "dictionary-ready" : "dictionary-loading"}</div>
      <div>{isCpuTurnInProgress ? "cpu-thinking" : "cpu-idle"}</div>
      <div>{`turn-${game.turn}`}</div>
      <div>{`rack-${rackPlayer.id}`}</div>
    </div>
  );
}

function ScorePhaseHarness() {
  const {
    animationPhase,
    confirmTrade,
    currentPlayer,
    dictionary,
    game,
    passCurrentTurn,
    scoreCelebration,
    startLocalGame,
    submitCurrentMove,
  } = useGame();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    startLocalGame({
      players: [
        { name: "Player 1", kind: "human-local" },
        { name: "Player 2", kind: "human-local" },
      ],
    });
  }, [startLocalGame]);

  return (
    <div>
      <div>{dictionary.ready ? "dictionary-ready" : "dictionary-loading"}</div>
      <div>{`phase-${animationPhase}`}</div>
      <div>{`player-${currentPlayer.id}`}</div>
      <div>{`status-${game.status}`}</div>
      <div>{`turn-${game.turn}`}</div>
      <div>{`final-turn-${game.endgame.isFinalTurnPending ? game.endgame.finalTurnPlayerId : "none"}`}</div>
      <div>
        {scoreCelebration
          ? `celebration-${scoreCelebration.action}${scoreCelebration.points ? `-${scoreCelebration.points}` : ""}`
          : "celebration-none"}
      </div>
      <button type="button" onClick={submitCurrentMove}>
        play
      </button>
      <button type="button" onClick={confirmTrade}>
        trade
      </button>
      <button type="button" onClick={passCurrentTurn}>
        pass
      </button>
    </div>
  );
}

function PersistenceHarness() {
  const { game, hasSavedGame, isStorageHydrated, startLocalGame } = useGame();

  return (
    <div>
      <div>{isStorageHydrated ? "storage-ready" : "storage-loading"}</div>
      <div>{hasSavedGame ? "saved-game" : "no-saved-game"}</div>
      <div>{`status-${game.status}`}</div>
      <div>{`turn-${game.turn}`}</div>
      <button type="button" onClick={() => startLocalGame()}>
        start
      </button>
    </div>
  );
}

function ArchiveHarness() {
  const {
    game,
    hasSavedGame,
    isStorageHydrated,
    passCurrentTurn,
    startLocalGame,
  } = useGame();

  return (
    <div>
      <div>{isStorageHydrated ? "storage-ready" : "storage-loading"}</div>
      <div>{hasSavedGame ? "saved-game" : "no-saved-game"}</div>
      <div>{`status-${game.status}`}</div>
      <button type="button" onClick={() => startLocalGame()}>
        start
      </button>
      <button type="button" onClick={passCurrentTurn}>
        complete
      </button>
    </div>
  );
}

function DragStateHarness() {
  const { dragTileId, onDragCancel, onDragStart, startLocalGame } = useGame();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    startLocalGame({
      players: [
        { name: "Player 1", kind: "human-local" },
        { name: "Player 2", kind: "human-local" },
      ],
    });
  }, [startLocalGame]);

  return (
    <div>
      <div>{dragTileId ? `drag-${dragTileId}` : "drag-none"}</div>
      <button
        type="button"
        onClick={() =>
          onDragStart({
            active: {
              data: {
                current: {
                  source: "rack",
                  tileId: "rack-0",
                  rackIndex: 0,
                },
              },
            },
          } as Parameters<typeof onDragStart>[0])
        }
      >
        start-drag
      </button>
      <button
        type="button"
        onClick={() => onDragCancel({} as Parameters<typeof onDragCancel>[0])}
      >
        cancel-drag
      </button>
    </div>
  );
}

const mockedSubmitMove = vi.mocked(submitMove);
const mockedTradeTiles = vi.mocked(tradeTiles);
const mockedPassTurn = vi.mocked(passTurn);

describe("game context CPU flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve("cat\nat"),
        }),
      ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("resolves a CPU turn after showing the thinking state", async () => {
    render(
      <GameProvider>
        <CpuTurnHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("dictionary-ready")).toBeInTheDocument();
    expect(screen.getByText("cpu-thinking")).toBeInTheDocument();
    expect(screen.getByText("turn-1")).toBeInTheDocument();
    expect(screen.getByText("rack-player-2")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(850);
    });

    expect(resolveCpuTurn).toHaveBeenCalledTimes(1);
    expect(screen.getByText("cpu-idle")).toBeInTheDocument();
    expect(screen.getByText("turn-2")).toBeInTheDocument();
    expect(screen.getByText("rack-player-2")).toBeInTheDocument();
  });

  it("holds a scoring move in the score-burst phase before advancing turns", async () => {
    mockedSubmitMove.mockImplementationOnce((state) => {
      const finalState: GameState = {
        ...state,
        currentPlayerIndex: 1,
        status: "handoff",
        handoff: {
          nextPlayerId: "player-2",
          reason: "play",
        },
        turn: 2,
        endgame: {
          isFinalTurnPending: true,
          finalTurnPlayerId: "player-2",
        },
        players: state.players.map((player, index) =>
          index === 0 ? { ...player, score: player.score + 18 } : player,
        ),
        logs: [
          {
            id: "log-play",
            playerId: "player-1",
            action: "play",
            summary: "Player 1 played HELLO for 18 points.",
            words: ["HELLO"],
            points: 18,
            createdAt: Date.now(),
          },
          ...state.logs,
        ],
      };

      return {
        state: finalState,
        validation: {
          isValid: true,
          words: [],
          totalPoints: 18,
          markers: [],
        },
      };
    });

    render(
      <GameProvider>
        <ScorePhaseHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "play" }));

    expect(screen.getByText("phase-score-burst")).toBeInTheDocument();
    expect(screen.getByText("player-player-1")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();
    expect(screen.getByText("turn-1")).toBeInTheDocument();
    expect(screen.getByText("final-turn-player-2")).toBeInTheDocument();
    expect(screen.getByText("celebration-play-18")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByText("phase-idle")).toBeInTheDocument();
    expect(screen.getByText("player-player-2")).toBeInTheDocument();
    expect(screen.getByText("status-handoff")).toBeInTheDocument();
    expect(screen.getByText("turn-2")).toBeInTheDocument();
    expect(screen.getByText("final-turn-player-2")).toBeInTheDocument();
    expect(screen.getByText("celebration-none")).toBeInTheDocument();
  });

  it("holds a trade move in the score-burst phase before advancing turns", async () => {
    mockedTradeTiles.mockImplementationOnce((state) => ({
      ...state,
      currentPlayerIndex: 1,
      status: "handoff",
      handoff: {
        nextPlayerId: "player-2",
        reason: "trade",
      },
      turn: 2,
      logs: [
        {
          id: "log-trade",
          playerId: "player-1",
          action: "trade",
          summary: "Player 1 traded 3 tiles.",
          createdAt: Date.now(),
        },
        ...state.logs,
      ],
    }));

    render(
      <GameProvider>
        <ScorePhaseHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "trade" }));

    expect(screen.getByText("phase-score-burst")).toBeInTheDocument();
    expect(screen.getByText("player-player-1")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();
    expect(screen.getByText("turn-1")).toBeInTheDocument();
    expect(screen.getByText("celebration-trade")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByText("phase-idle")).toBeInTheDocument();
    expect(screen.getByText("player-player-2")).toBeInTheDocument();
    expect(screen.getByText("status-handoff")).toBeInTheDocument();
    expect(screen.getByText("turn-2")).toBeInTheDocument();
    expect(screen.getByText("celebration-none")).toBeInTheDocument();
  });

  it("holds a pass move in the score-burst phase before advancing turns", async () => {
    mockedPassTurn.mockImplementationOnce((state) => ({
      ...state,
      currentPlayerIndex: 1,
      status: "handoff",
      handoff: {
        nextPlayerId: "player-2",
        reason: "pass",
      },
      turn: 2,
      logs: [
        {
          id: "log-pass",
          playerId: "player-1",
          action: "pass",
          summary: "Player 1 passed.",
          createdAt: Date.now(),
        },
        ...state.logs,
      ],
    }));

    render(
      <GameProvider>
        <ScorePhaseHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "pass" }));

    expect(screen.getByText("phase-score-burst")).toBeInTheDocument();
    expect(screen.getByText("player-player-1")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();
    expect(screen.getByText("turn-1")).toBeInTheDocument();
    expect(screen.getByText("celebration-pass")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByText("phase-idle")).toBeInTheDocument();
    expect(screen.getByText("player-player-2")).toBeInTheDocument();
    expect(screen.getByText("status-handoff")).toBeInTheDocument();
    expect(screen.getByText("turn-2")).toBeInTheDocument();
    expect(screen.getByText("celebration-none")).toBeInTheDocument();
  });

  it("lands on completed after the granted final turn resolves", async () => {
    mockedPassTurn.mockImplementationOnce((state) => ({
      ...state,
      status: "completed",
      handoff: null,
      winnerId: "player-1",
      endgame: {
        isFinalTurnPending: false,
        finalTurnPlayerId: null,
      },
      logs: [
        {
          id: "log-win",
          playerId: "player-1",
          action: "win",
          summary: "Player 1 wins with 22 points.",
          createdAt: Date.now(),
        },
        {
          id: "log-pass-final",
          playerId: "player-1",
          action: "pass",
          summary: "Player 1 passed.",
          createdAt: Date.now(),
        },
        ...state.logs,
      ],
    }));

    render(
      <GameProvider>
        <ScorePhaseHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "pass" }));

    expect(screen.getByText("phase-idle")).toBeInTheDocument();
    expect(screen.getByText("status-completed")).toBeInTheDocument();
    expect(screen.getByText("celebration-none")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByText("phase-idle")).toBeInTheDocument();
    expect(screen.getByText("status-completed")).toBeInTheDocument();
    expect(screen.getByText("final-turn-none")).toBeInTheDocument();
    expect(screen.getByText("celebration-none")).toBeInTheDocument();
  });

  it("persists a started game and restores it on the next load", async () => {
    const { unmount } = render(
      <GameProvider>
        <PersistenceHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("storage-ready")).toBeInTheDocument();
    expect(screen.getByText("no-saved-game")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "start" }));

    expect(screen.getByText("saved-game")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();

    const persistedGame = window.localStorage.getItem("scrabble.local-game");
    expect(persistedGame).toBeTruthy();

    unmount();

    render(
      <GameProvider>
        <PersistenceHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("storage-ready")).toBeInTheDocument();
    expect(screen.getByText("saved-game")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();
  });

  it("does not allow a second game to replace a restored one", async () => {
    render(
      <GameProvider>
        <PersistenceHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "start" }));

    const firstPersistedGame = window.localStorage.getItem("scrabble.local-game");
    expect(firstPersistedGame).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "start" }));

    expect(window.localStorage.getItem("scrabble.local-game")).toBe(
      firstPersistedGame,
    );
    expect(screen.getByText("saved-game")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();
  });

  it("archives completed games and allows a new game to start", async () => {
    mockedPassTurn.mockImplementationOnce((state) => ({
      ...state,
      status: "completed",
      handoff: null,
      winnerId: "player-1",
      endgame: {
        isFinalTurnPending: false,
        finalTurnPlayerId: null,
      },
      logs: [
        {
          id: "log-win",
          playerId: "player-1",
          action: "win",
          summary: "Player 1 wins with 22 points.",
          createdAt: Date.now(),
        },
        ...state.logs,
      ],
    }));

    render(
      <GameProvider>
        <ArchiveHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "start" }));
    expect(screen.getByText("saved-game")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "complete" }));

    expect(screen.getByText("no-saved-game")).toBeInTheDocument();
    expect(screen.getByText("status-completed")).toBeInTheDocument();
    expect(window.localStorage.getItem("scrabble.local-game")).toBeNull();

    const storedHistory = window.localStorage.getItem("scrabble.game-history");
    expect(storedHistory).toBeTruthy();
    expect(JSON.parse(storedHistory ?? "[]")).toHaveLength(1);
    expect(JSON.parse(storedHistory ?? "[]")[0].game.status).toBe("completed");

    fireEvent.click(screen.getByRole("button", { name: "start" }));

    expect(screen.getByText("saved-game")).toBeInTheDocument();
    expect(screen.getByText("status-active")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("scrabble.game-history") ?? "[]")).toHaveLength(1);
  });

  it("clears the active drag tile when a drag is cancelled", async () => {
    render(
      <GameProvider>
        <DragStateHarness />
      </GameProvider>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("drag-none")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "start-drag" }));
    expect(screen.getByText("drag-rack-0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "cancel-drag" }));
    expect(screen.getByText("drag-none")).toBeInTheDocument();
  });
});
