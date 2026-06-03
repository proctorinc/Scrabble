import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GameSetupPanel } from "@/components/game/game-setup-panel";
import { chooseCpuMove } from "@/lib/scrabble/cpu";
import {
  applyCpuDecision,
  createBoard,
  createConfiguredGame,
  passTurn,
  submitMove,
} from "@/lib/scrabble/game";
import { createHumanVsCpuConfig } from "@/lib/scrabble/setup";
import { CpuDifficulty, GameState, Tile } from "@/types/game";

function makeTile(letter: string, value: number, id = letter) {
  return {
    id,
    letter,
    value,
    isBlank: false,
  } satisfies Tile;
}

function makeBlank(id = "blank") {
  return {
    id,
    letter: "",
    value: 0,
    isBlank: true,
  } satisfies Tile;
}

function makeCpuState(difficulty: CpuDifficulty): GameState {
  const state = createConfiguredGame(createHumanVsCpuConfig(difficulty), () => 0.5);
  state.status = "active";
  state.currentPlayerIndex = 1;
  state.handoff = null;
  state.logs = [];
  state.players[0].rack = [];
  state.players[1].rack = [];
  state.bag = [];
  return state;
}

describe("cpu engine", () => {
  it("creates a configured CPU player through local game setup", () => {
    const game = createConfiguredGame(createHumanVsCpuConfig("hard"), () => 0.5);

    expect(game.players[1].kind).toBe("computer");
    expect(game.players[1].cpuConfig?.difficulty).toBe("hard");
  });

  it("renders the CPU setup controls", () => {
    render(
      <GameSetupPanel
        title="New Game"
        description="Pick a mode"
        onStart={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /local 2 player/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vs cpu/i })).toBeInTheDocument();
  });

  it("finds an opening play for a CPU rack", () => {
    const state = makeCpuState("hard");
    state.players[1].rack = [makeTile("C", 3, "c"), makeTile("A", 1, "a"), makeTile("T", 1, "t")];
    state.bag = [makeTile("E", 1, "e")];

    const decision = chooseCpuMove(state, ["cat", "at"]);

    expect(decision.type).toBe("play");
    if (decision.type === "play") {
      expect(decision.words).toContain("CAT");
    }
  });

  it("updates the CPU rack after playing a word", () => {
    const state = makeCpuState("hard");
    state.players[1].rack = [
      makeTile("C", 3, "c"),
      makeTile("A", 1, "a"),
      makeTile("T", 1, "t"),
    ];
    state.bag = [makeTile("E", 1, "e")];

    const decision = chooseCpuMove(state, ["cat", "at"]);

    expect(decision.type).toBe("play");
    if (decision.type !== "play") {
      return;
    }

    const next = applyCpuDecision(state, decision, new Set(["cat", "at"]));
    const boardLetters = next.board
      .flatMap((row) => row.map((cell) => cell.tile?.letter ?? null))
      .filter((letter): letter is string => letter !== null)
      .sort();

    expect(next.players[1].rack).toEqual([makeTile("E", 1, "e")]);
    expect(boardLetters).toEqual(["A", "C", "T"]);
  });

  it("finds a connected CPU move on an existing board", () => {
    const state = makeCpuState("hard");
    state.board[7][7].tile = makeTile("C", 3, "c");
    state.players[1].rack = [makeTile("A", 1, "a"), makeTile("T", 1, "t")];

    const decision = chooseCpuMove(state, ["cat", "at"]);

    expect(decision.type).toBe("play");
    if (decision.type === "play") {
      expect(decision.placements).toHaveLength(2);
      expect(decision.words).toContain("CAT");
    }
  });

  it("assigns blank letters in CPU-generated plays", () => {
    const state = makeCpuState("hard");
    state.players[1].rack = [makeBlank("blank"), makeTile("T", 1, "t")];

    const decision = chooseCpuMove(state, ["at"]);

    expect(decision.type).toBe("play");
    if (decision.type === "play") {
      expect(decision.placements.some((placement) => placement.tile.isBlank && placement.tile.letter === "A")).toBe(true);
    }
  });

  it("trades when it cannot make an acceptable play and the bag can support it", () => {
    const state = makeCpuState("easy");
    state.players[1].rack = [makeTile("Q", 10, "q"), makeTile("Z", 10, "z"), makeTile("X", 8, "x")];
    state.bag = [makeTile("A", 1, "a"), makeTile("E", 1, "e"), makeTile("I", 1, "i"), makeTile("O", 1, "o")];

    const decision = chooseCpuMove(state, ["cat", "dog"]);

    expect(decision.type).toBe("trade");
    if (decision.type === "trade") {
      expect(decision.tileIds.length).toBeGreaterThan(0);
    }
  });

  it("passes when it has no play and cannot trade", () => {
    const state = makeCpuState("easy");
    state.players[1].rack = [makeTile("Q", 10, "q"), makeTile("Z", 10, "z")];
    state.bag = [];

    const decision = chooseCpuMove(state, ["cat", "dog"]);

    expect(decision.type).toBe("pass");
  });

  it("uses broader knowledge on harder difficulties", () => {
    const easyState = makeCpuState("easy");
    easyState.players[1].rack = [makeTile("R", 1, "r"), makeTile("E", 1, "e"), makeTile("A", 1, "a"), makeTile("C", 3, "c"), makeTile("T", 1, "t")];
    const hardState = makeCpuState("hard");
    hardState.players[1].rack = [makeTile("R", 1, "r"), makeTile("E", 1, "e"), makeTile("A", 1, "a"), makeTile("C", 3, "c"), makeTile("T", 1, "t")];

    const words = ["react"];
    const easyDecision = chooseCpuMove(easyState, words);
    const hardDecision = chooseCpuMove(hardState, words);

    expect(easyDecision.type).not.toBe("play");
    expect(hardDecision.type).toBe("play");
  });

  it("skips handoff when a human turn passes control to a CPU", () => {
    const state = createConfiguredGame(createHumanVsCpuConfig("medium"), () => 0.5);
    state.players[0].rack = [makeTile("C", 3, "c"), makeTile("A", 1, "a"), makeTile("T", 1, "t")];
    state.bag = [makeTile("E", 1, "e")];
    state.draft = [
      { row: 7, col: 7, tile: state.players[0].rack[0] },
      { row: 7, col: 8, tile: state.players[0].rack[1] },
      { row: 7, col: 9, tile: state.players[0].rack[2] },
    ];
    state.players[0].rack = [];

    const result = submitMove(state, new Set(["cat"]));

    expect(result.state.status).toBe("active");
    expect(result.state.handoff).toBeNull();
    expect(result.state.currentPlayerIndex).toBe(1);
  });

  it("keeps handoff for two human local players", () => {
    const state: GameState = {
      id: "local-pass",
      status: "active",
      board: createBoard(),
      bag: [],
      players: [
        { id: "player-1", name: "Player 1", kind: "human-local", score: 0, rack: [] },
        { id: "player-2", name: "Player 2", kind: "human-local", score: 0, rack: [] },
      ],
      currentPlayerIndex: 0,
      draft: [],
      logs: [],
      selectedTradeTileIds: [],
      handoff: null,
      winnerId: null,
      turn: 1,
      endgame: {
        isFinalTurnPending: false,
        finalTurnPlayerId: null,
      },
    };

    const result = passTurn(state);

    expect(result.status).toBe("handoff");
    expect(result.handoff?.nextPlayerId).toBe("player-2");
  });
});
