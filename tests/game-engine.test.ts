import { describe, expect, it } from "vitest";
import {
  createBoard,
  createInitialGame,
  forfeitGame,
  passTurn,
  setBlankTileLetter,
  submitMove,
  toggleTradeSelection,
  tradeTiles,
  validateDraft,
} from "@/lib/scrabble/game";
import { GameState, Tile } from "@/types/game";

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

function makeState(): GameState {
  return {
    id: "test-game",
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
}

describe("scrabble game engine", () => {
  it("creates a full standard bag and two seven-tile racks", () => {
    const game = createInitialGame(() => 0.5);
    const totalTiles =
      game.bag.length + game.players[0].rack.length + game.players[1].rack.length;
    const blankCount =
      game.bag.filter((tile) => tile.isBlank).length +
      game.players.flatMap((player) => player.rack).filter((tile) => tile.isBlank).length;

    expect(totalTiles).toBe(100);
    expect(game.players[0].rack).toHaveLength(7);
    expect(game.players[1].rack).toHaveLength(7);
    expect(blankCount).toBe(2);
  });

  it("requires the opening move to cover the center square", () => {
    const state = makeState();
    state.draft = [
      { row: 0, col: 0, tile: makeTile("C", 3, "c") },
      { row: 0, col: 1, tile: makeTile("A", 1, "a") },
      { row: 0, col: 2, tile: makeTile("T", 1, "t") },
    ];

    const validation = validateDraft(state, new Set(["cat"]));

    expect(validation.isValid).toBe(false);
    expect(validation.reason).toContain("center");
  });

  it("rejects gapped placements on the same row", () => {
    const state = makeState();
    state.draft = [
      { row: 7, col: 7, tile: makeTile("A", 1, "a") },
      { row: 7, col: 9, tile: makeTile("T", 1, "t") },
    ];

    const validation = validateDraft(state, new Set(["at"]));

    expect(validation.isValid).toBe(false);
    expect(validation.reason).toContain("continuous");
  });

  it("scores the opening center word and advances to handoff", () => {
    const state = makeState();
    state.bag = [makeTile("E", 1, "extra")];
    state.players[0].rack = [makeTile("C", 3, "c"), makeTile("A", 1, "a"), makeTile("T", 1, "t")];
    state.draft = [
      { row: 7, col: 7, tile: state.players[0].rack[0] },
      { row: 7, col: 8, tile: state.players[0].rack[1] },
      { row: 7, col: 9, tile: state.players[0].rack[2] },
    ];
    state.players[0].rack = [];

    const result = submitMove(state, new Set(["cat"]));

    expect(result.validation.isValid).toBe(true);
    expect(result.validation.totalPoints).toBe(10);
    expect(result.state.players[0].score).toBe(10);
    expect(result.state.status).toBe("handoff");
    expect(result.state.turn).toBe(2);
    expect(result.state.board[7][7].tileOwnerId).toBe("player-1");
    expect(result.state.board[7][8].tileOwnerId).toBe("player-1");
    expect(result.state.board[7][9].tileOwnerId).toBe("player-1");
  });

  it("requires a blank tile to be assigned before play", () => {
    const state = makeState();
    const blank = makeBlank();
    state.draft = [
      { row: 7, col: 7, tile: blank },
      { row: 7, col: 8, tile: makeTile("T", 1, "t") },
    ];

    const invalid = validateDraft(state, new Set(["at"]));
    const valid = validateDraft(setBlankTileLetter(state, blank.id, "A"), new Set(["at"]));

    expect(invalid.isValid).toBe(false);
    expect(invalid.markers[0]?.tone).toBe("error");
    expect(invalid.markers[0]?.cells).toEqual([{ row: 7, col: 7 }]);
    expect(valid.isValid).toBe(true);
    expect(valid.markers[0]?.tone).toBe("success");
    expect(valid.markers).toHaveLength(1);
    expect(valid.markers[0]?.points).toBe(valid.totalPoints);
  });

  it("marks invalid words at their board locations", () => {
    const state = makeState();
    state.draft = [
      { row: 7, col: 7, tile: makeTile("C", 3, "c") },
      { row: 7, col: 8, tile: makeTile("A", 1, "a") },
      { row: 7, col: 9, tile: makeTile("T", 1, "t") },
    ];

    const validation = validateDraft(state, new Set(["dog"]));

    expect(validation.isValid).toBe(false);
    expect(validation.reason).toBe('"CAT" is not a valid word.');
    expect(validation.markers).toEqual([
      expect.objectContaining({
        tone: "error",
        word: "CAT",
        anchor: { row: 7, col: 9 },
        message: '"CAT" is not a valid word.',
        cells: [
          { row: 7, col: 7 },
          { row: 7, col: 8 },
          { row: 7, col: 9 },
        ],
      }),
    ]);
  });

  it("trades selected tiles and hands the game to the next player", () => {
    const state = makeState();
    state.bag = [makeTile("N", 1, "n"), makeTile("O", 1, "o"), makeTile("P", 3, "p")];
    state.players[0].rack = [makeTile("A", 1, "a"), makeTile("B", 3, "b"), makeTile("C", 3, "c")];

    const afterSelection = toggleTradeSelection(state, "a");
    const traded = tradeTiles(afterSelection, () => 0);

    expect(traded.currentPlayerIndex).toBe(1);
    expect(traded.status).toBe("handoff");
    expect(traded.players[0].rack).toHaveLength(3);
    expect(traded.logs[0]?.action).toBe("trade");
  });

  it("applies endgame rack penalties when the bag is empty and a rack is cleared", () => {
    const state = makeState();
    state.board[7][7].tile = makeTile("C", 3, "c");
    state.players[0].rack = [makeTile("A", 1, "a"), makeTile("T", 1, "t")];
    state.players[1].rack = [makeTile("Z", 10, "z")];
    state.draft = [
      { row: 7, col: 8, tile: state.players[0].rack[0] },
      { row: 7, col: 9, tile: state.players[0].rack[1] },
    ];
    state.players[0].rack = [];

    const result = submitMove(state, new Set(["cat"]));

    expect(result.state.status).toBe("completed");
    expect(result.state.players[0].score).toBe(15);
    expect(result.state.players[1].score).toBe(-10);
    expect(result.state.winnerId).toBe("player-1");
  });

  it("starts a final-turn handoff when a move empties the bag without clearing the rack", () => {
    const state = makeState();
    state.players[0].rack = [
      makeTile("C", 3, "c"),
      makeTile("A", 1, "a"),
      makeTile("T", 1, "t"),
      makeTile("R", 1, "r"),
    ];
    state.players[1].rack = [makeTile("Z", 10, "z")];
    state.bag = [makeTile("E", 1, "e")];
    state.draft = [
      { row: 7, col: 7, tile: state.players[0].rack[0] },
      { row: 7, col: 8, tile: state.players[0].rack[1] },
      { row: 7, col: 9, tile: state.players[0].rack[2] },
    ];
    state.players[0].rack = [state.players[0].rack[3]];

    const result = submitMove(state, new Set(["cat"]));

    expect(result.state.status).toBe("handoff");
    expect(result.state.currentPlayerIndex).toBe(1);
    expect(result.state.endgame).toEqual({
      isFinalTurnPending: true,
      finalTurnPlayerId: "player-2",
    });
    expect(result.state.players[0].rack).toEqual([makeTile("R", 1, "r"), makeTile("E", 1, "e")]);
    expect(result.state.bag).toHaveLength(0);
  });

  it("completes after the owed player uses the final turn to play", () => {
    const state = makeState();
    state.board[7][7].tile = makeTile("C", 3, "c");
    state.players[0].score = 20;
    state.players[0].rack = [makeTile("R", 1, "r")];
    state.players[1].score = 12;
    state.players[1].rack = [makeTile("A", 1, "a"), makeTile("T", 1, "t")];
    state.currentPlayerIndex = 1;
    state.bag = [];
    state.endgame = {
      isFinalTurnPending: true,
      finalTurnPlayerId: "player-2",
    };
    state.draft = [
      { row: 7, col: 8, tile: state.players[1].rack[0] },
      { row: 7, col: 9, tile: state.players[1].rack[1] },
    ];
    state.players[1].rack = [];

    const result = submitMove(state, new Set(["cat"]));

    expect(result.state.status).toBe("completed");
    expect(result.state.currentPlayerIndex).toBe(1);
    expect(result.state.players[1].score).toBe(18);
    expect(result.state.winnerId).toBe("player-1");
    expect(result.state.endgame).toEqual({
      isFinalTurnPending: false,
      finalTurnPlayerId: null,
    });
  });

  it("completes after the owed player passes their final turn", () => {
    const state = makeState();
    state.players[0].score = 18;
    state.players[1].score = 12;
    state.players[1].rack = [makeTile("Q", 10, "q")];
    state.currentPlayerIndex = 1;
    state.endgame = {
      isFinalTurnPending: true,
      finalTurnPlayerId: "player-2",
    };

    const result = passTurn(state);

    expect(result.status).toBe("completed");
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.winnerId).toBe("player-1");
    expect(result.logs[0]?.action).toBe("win");
    expect(result.logs[1]?.action).toBe("pass");
  });

  it("uses current score to choose the winner after the granted final turn", () => {
    const state = makeState();
    state.players[0].score = 8;
    state.players[1].score = 10;
    state.currentPlayerIndex = 1;
    state.endgame = {
      isFinalTurnPending: true,
      finalTurnPlayerId: "player-2",
    };

    const result = passTurn(state);

    expect(result.status).toBe("completed");
    expect(result.winnerId).toBe("player-2");
  });

  it("awards the game to the opponent when the current player forfeits", () => {
    const state = makeState();
    state.currentPlayerIndex = 0;
    state.draft = [{ row: 7, col: 7, tile: makeTile("A", 1, "a") }];
    state.selectedTradeTileIds = ["a"];

    const result = forfeitGame(state);

    expect(result.status).toBe("completed");
    expect(result.winnerId).toBe("player-2");
    expect(result.draft).toEqual([]);
    expect(result.selectedTradeTileIds).toEqual([]);
    expect(result.logs[0]?.summary).toBe(
      "Player 1 forfeited. Player 2 wins by forfeit.",
    );
  });
});
