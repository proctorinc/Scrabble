import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "@/components/action/action-bar";
import { MobileActionBar } from "@/components/action/mobile-action-bar";
import { BoardCell } from "@/components/board/board-cell";
import { Tile as TileButton } from "@/components/player/tile";
import { useGame } from "@/context/game-context";
import { DraftPlacement, GameState, Tile } from "@/types/game";

vi.mock("@/context/game-context", () => ({
  useGame: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    setNodeRef: vi.fn(),
    listeners: {},
    attributes: {},
    isDragging: false,
  }),
}));

vi.mock("@/components/player/rack", () => ({
  Rack: () => <div>Rack</div>,
}));

vi.mock("@/components/player/trade-tiles-modal", () => ({
  TradeTilesModal: () => null,
}));

vi.mock("@/components/player/trade-tiles-drawer", () => ({
  TradeTilesDrawer: () => null,
}));

vi.mock("@/components/action/mobile-menu-drawer", () => ({
  MobileMenuDrawer: () => null,
}));

vi.mock("@/components/action/action-confirmation-dialog", () => ({
  ActionConfirmationDialog: () => null,
}));

const mockedUseGame = vi.mocked(useGame);

function makeTile(id: string, letter = "A"): Tile {
  return {
    id,
    letter,
    value: 1,
    isBlank: false,
  };
}

function makeGameContext(overrides: Partial<ReturnType<typeof useGame>> = {}) {
  const game = {
    status: "active",
    draft: [],
  } as GameState;

  return {
    board: [],
    currentPlayer: {
      id: "player-1",
      rack: Array.from({ length: 7 }, (_, index) => makeTile(`rack-${index}`)),
    },
    dictionary: { ready: true, list: [], words: new Set<string>() },
    draftValidation: null,
    getPlayerTileTint: vi.fn(() => "neutral"),
    game,
    isInteractionLocked: false,
    isCpuTurnInProgress: false,
    lastPlayedTileIds: [],
    playedTilesUsePlayerColors: false,
    validationMessage: null,
    submitCurrentMove: vi.fn(),
    passCurrentTurn: vi.fn(),
    forfeitGame: vi.fn(),
    shuffleCurrentRack: vi.fn(),
    togglePlayedTilesUsePlayerColors: vi.fn(),
    returnTiles: vi.fn(),
    returnTileToTray: vi.fn(),
    defineSearch: { query: "", matches: [] },
    searchDictionary: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useGame>;
}

describe("tile interactivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a draft tile to the tray when the board tile is clicked", () => {
    const draftTile = makeTile("draft-1", "D");
    const returnTileToTray = vi.fn();

    mockedUseGame.mockReturnValue(
      makeGameContext({
        returnTileToTray,
      }),
    );

    render(
      <BoardCell
        cell={{ row: 7, col: 7, bonus: "", tile: null, tileOwnerId: null }}
        draftTile={{ row: 7, col: 7, tile: draftTile } satisfies DraftPlacement}
        markers={[]}
        isMarkerOpen={false}
        onToggleMarker={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /d/i }));

    expect(returnTileToTray).toHaveBeenCalledWith("draft-1");
  });

  it("enables the desktop return button only when tiles are played", () => {
    const returnTiles = vi.fn();

    mockedUseGame.mockReturnValue(
      makeGameContext({
        game: { status: "active", draft: [] } as GameState,
        returnTiles,
      }),
    );

    const { rerender } = render(<ActionBar />);

    expect(
      screen.getByRole("button", { name: "Return played tiles" }),
    ).toBeDisabled();

    mockedUseGame.mockReturnValue(
      makeGameContext({
        game: {
          status: "active",
          draft: [{ row: 7, col: 7, tile: makeTile("draft-2", "E") }],
        } as GameState,
        returnTiles,
      }),
    );

    rerender(<ActionBar />);

    const returnButton = screen.getByRole("button", {
      name: "Return played tiles",
    });

    expect(returnButton).toBeEnabled();
    fireEvent.click(returnButton);
    expect(returnTiles).toHaveBeenCalledTimes(1);
  });

  it("shows the mobile return button with the same enabled state", () => {
    mockedUseGame.mockReturnValue(
      makeGameContext({
        game: { status: "active", draft: [] } as GameState,
      }),
    );

    const { rerender } = render(<MobileActionBar />);

    expect(screen.getByRole("button", { name: /return/i })).toBeDisabled();

    mockedUseGame.mockReturnValue(
      makeGameContext({
        game: {
          status: "active",
          draft: [{ row: 7, col: 7, tile: makeTile("draft-3", "F") }],
        } as GameState,
      }),
    );

    rerender(<MobileActionBar />);

    expect(screen.getByRole("button", { name: /return/i })).toBeEnabled();
  });

  it("opens a confirmation dialog before passing on desktop", () => {
    const passCurrentTurn = vi.fn();

    mockedUseGame.mockReturnValue(
      makeGameContext({
        passCurrentTurn,
      }),
    );

    render(<ActionBar />);

    fireEvent.click(screen.getByRole("button", { name: "Pass turn" }));

    expect(passCurrentTurn).not.toHaveBeenCalled();
  });

  it("tints committed board tiles with the owning player's color when enabled", () => {
    mockedUseGame.mockReturnValue(
      makeGameContext({
        playedTilesUsePlayerColors: true,
        getPlayerTileTint: vi.fn(() => "rose"),
      }),
    );

    render(
      <BoardCell
        cell={{
          row: 7,
          col: 7,
          bonus: "",
          tile: makeTile("played-1", "P"),
          tileOwnerId: "player-2",
        }}
        draftTile={undefined}
        markers={[]}
        isMarkerOpen={false}
        onToggleMarker={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /p/i })).toHaveClass(
      "bg-badge-rose",
      "border-player-rose",
      "text-player-rose",
    );
  });

  it("lightens the last played committed tiles instead of ringing the cell", () => {
    mockedUseGame.mockReturnValue(
      makeGameContext({
        lastPlayedTileIds: ["played-2"],
      }),
    );

    render(
      <BoardCell
        cell={{
          row: 7,
          col: 7,
          bonus: "",
          tile: makeTile("played-2", "L"),
          tileOwnerId: "player-1",
        }}
        draftTile={undefined}
        markers={[]}
        isMarkerOpen={false}
        onToggleMarker={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /l/i })).toHaveClass(
      "tile-last-played",
    );
  });

  it("applies touch-action none only to draggable tiles", () => {
    render(
      <>
        <TileButton
          tile={makeTile("drag-tile", "T")}
          dragData={{ source: "rack", tileId: "drag-tile", rackIndex: 0 }}
        />
        <TileButton tile={makeTile("static-tile", "S")} />
      </>,
    );

    expect(screen.getByRole("button", { name: /t/i })).toHaveStyle({
      touchAction: "none",
    });
    expect(screen.getByRole("button", { name: /s/i })).not.toHaveStyle({
      touchAction: "none",
    });
  });
});
