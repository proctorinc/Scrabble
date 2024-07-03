import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { BoardCells, Cell, CellWithTile, Tile } from "../types";
import {
  addTileToBoard,
  areHorizontalLettersConnected,
  areVerticalLettersConnected,
  getCellsWithInPlayTiles,
  getTileAtLocation,
  isFirstTurn,
  isTileOnBoard,
  isTileOnCenterOfTheBoard,
  isWordConnectedToPreviousTile,
  removePlayerTilesFromBoard,
  removeTileFromBoard,
  somethingCheckHorizontalWord,
  somethingCheckVerticalWord,
} from "../utils";
import useGame from "../hooks/useGame";
import usePlayer from "../hooks/usePlayer";

type Props = {
  children: ReactNode;
};

type BoardContext = {
  board: Cell[][];
  playTile: (tile: Tile, row: number, col: number) => void;
  returnTile: (tile: Tile) => void;
  returnAllPlayerTiles: () => void;
  isTileOnCell: (row: number, col: number) => boolean;
  isTilePlayed: (tile: Tile) => boolean;
  validCells: CellWithTile[];
  isValidLetterPlacement: boolean;
};

const BoardContext = createContext<BoardContext | null>(null);

export const BoardContextProvider: FC<Props> = ({ children }) => {
  const { state } = useGame();
  const {
    playTile: playPlayerTile,
    returnTile: returnPlayerTile,
    returnTiles: returnPlayerTiles,
  } = usePlayer();
  const [board, setBoard] = useState<BoardCells>(state.board.cells);
  const [isValidLetterPlacement, setIsValidLetterPlacement] = useState(false);
  const [validCells, setValidCells] = useState<CellWithTile[]>([]);

  useEffect(() => {
    const cells = checkForValidLetterPlacement();

    setValidCells(cells);
    setIsValidLetterPlacement(cells.length > 0);
  }, [board]);

  function playTile(tile: Tile, row: number, col: number) {
    if (isTileOnBoard(tile, board)) {
      moveTileOnBoard(tile, row, col);
    } else {
      playTileFromPlayer(tile, row, col);
    }
  }

  function playTileFromPlayer(tile: Tile, row: number, col: number) {
    const existingTile = getTileAtLocation(board, row, col);

    // If tile exists and its a player's, return it to the player
    if (existingTile !== null && existingTile.in_play) {
      returnTile(existingTile);
    }

    // If no tile exists or its the player's, place new tile at location
    if (existingTile === null || existingTile.in_play) {
      setBoard((prev) => addTileToBoard(tile, prev, row, col));
      playPlayerTile(tile);
    }
  }

  function moveTileOnBoard(tile: Tile, row: number, col: number) {
    const existingTile = getTileAtLocation(board, row, col);

    // If tile exists and its a player's, return it to the player
    if (existingTile !== null && existingTile.in_play) {
      returnTile(existingTile);
    }

    // If no tile exists or its the player's, place new tile at location
    if (existingTile === null || existingTile.in_play) {
      setBoard((prev) => removeTileFromBoard(tile, prev));
      setBoard((prev) => addTileToBoard(tile, prev, row, col));
    }
  }

  function checkForValidLetterPlacement(): CellWithTile[] {
    // Get all cells that are currently in play
    const cells = getCellsWithInPlayTiles(board);

    // If first turn, tile must be placed on center cell
    if (isFirstTurn(board)) {
      if (!isTileOnCenterOfTheBoard(board)) {
        console.log("First turn and word is not in the center of the board");
        return [];
      }
    } else if (!isWordConnectedToPreviousTile(cells, board)) {
      // TODO: Otherwise make sure the tiles are placed next to a previous tile
      console.log(
        "At least one tile in the word must be placed next to a previous tile"
      );
      return [];
    }

    // Check more than one cell has been played
    if (cells.length === 0) {
      console.log("Invalid word none played");
      return [];
    }

    // Check letters are in the same vertical column
    const isValidVerticalPlacement = cells.every((cell) => {
      return cell.col === cells[0].col;
    });

    // Make sure vertical tiles are all connected
    if (
      isValidVerticalPlacement &&
      !areVerticalLettersConnected(cells, board)
    ) {
      console.log("Invalid spaces between vertical tiles");
      return [];
    }

    // Check letters are in the same horizontal row
    const isValidHorizontalPlacement = cells.every((cell) => {
      return cell.row === cells[0].row;
    });

    // Make sure horizontal tiles are all connected
    if (
      isValidHorizontalPlacement &&
      !areHorizontalLettersConnected(cells, board)
    ) {
      console.log("Invalid spaces between horiztonal tiles");
      return [];
    }

    // Must be either horizontal or vertical placement
    if (!isValidHorizontalPlacement && !isValidVerticalPlacement) {
      console.log("Invalid horizontal word");
      return [];
    }

    // const words: string[] = [];

    // Validate that there are no gaps between the tiles
    if (isValidHorizontalPlacement) {
      // Get all word combinations
      somethingCheckHorizontalWord(cells[0], board);
    } else {
      // Get all word combinations
      somethingCheckVerticalWord(cells[0], board);
    }

    console.log("Valid word!!");
    return cells;
  }

  function returnTile(tile: Tile) {
    setBoard((prev) => removeTileFromBoard(tile, prev));
    returnPlayerTile(tile);
  }

  function returnAllPlayerTiles() {
    const tiles = removePlayerTilesFromBoard(board);
    returnPlayerTiles(tiles);
  }

  function isTileOnCell(row: number, col: number) {
    return getTileAtLocation(board, row, col) !== null;
  }

  function isTilePlayed(tile: Tile) {
    return isTileOnBoard(tile, board);
  }

  const contextData = {
    board,
    playTile,
    returnTile,
    returnAllPlayerTiles,
    isTileOnCell,
    isTilePlayed,
    validCells,
    isValidLetterPlacement,
  };

  return (
    <BoardContext.Provider value={contextData}>
      {children}
    </BoardContext.Provider>
  );
};

export default BoardContext;
