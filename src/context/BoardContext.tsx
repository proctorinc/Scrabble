import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { BoardCells, Cell, CellWithTile, Tile, WordOnBoard } from "../types";
import {
  addTileToBoard,
  areHorizontalLettersConnected,
  areVerticalLettersConnected,
  getCellsWithInPlayTiles,
  getPlayedWords,
  getTileAtLocation,
  getTotalPoints,
  isFirstTurn,
  isTileOnBoard,
  isTileOnCenterOfTheBoard,
  isWordConnectedToPreviousTile,
  removePlayerTilesFromBoard,
  removeTileFromBoard,
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
  playedCells: CellWithTile[];
  playedWords: WordOnBoard[];
  isValidLetterPlacement: boolean;
  isValidDefinitions: boolean;
  potentialPoints: number;
  getWildLetter: (tileId: string) => string;
  setWildLetter: (tileId: string, letter: string) => void;
  removeWildLetter: (tileId: string) => void;
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
  const [playedCells, setPlayedCells] = useState<CellWithTile[]>([]);
  const [playedWords, setPlayedWords] = useState<WordOnBoard[]>([]);
  const [potentialPoints, setPotentialPoints] = useState(0);
  const [wildLetters, setWildLetters] = useState(new Map<string, string>());
  const [isValidDefinitions, setIsValidDefinitions] = useState(false);
  const [isValidLetterPlacement, setIsValidLetterPlacement] = useState(false);

  useEffect(() => {
    setBoard(state.board.cells);
  }, [state]);

  useEffect(() => {
    const cells = getCellsWithInPlayTiles(board);
    setPlayedCells(cells);

    if (validateLetterPlacement(cells)) {
      setIsValidLetterPlacement(true);

      const words = getPlayedWords(cells, board);
      setPlayedWords(words);

      validateWordDefinitions(words).then((isValid) => {
        if (isValid) {
          const totalPoints = getTotalPoints(words);
          setPotentialPoints(totalPoints);
          setPlayedCells(cells);
          setIsValidDefinitions(true);
        } else {
          console.log("definitions failed validation");
          setIsValidDefinitions(false);
        }
      });
    } else {
      setPotentialPoints(0);
      setIsValidDefinitions(false);
      setIsValidLetterPlacement(false);
    }
  }, [board]);

  function playTile(tile: Tile, row: number, col: number) {
    if (isTileOnBoard(tile, board)) {
      console.log("Tile is already on the board");
      moveTileOnBoard(tile, row, col);
    } else {
      console.log("Tile is coming from the user");
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

  function validateLetterPlacement(cells: CellWithTile[]): boolean {
    // If first turn, tile must be placed on center cell
    if (isFirstTurn(board)) {
      if (!isTileOnCenterOfTheBoard(board)) {
        console.log("First turn and word is not in the center of the board");
        return false;
      }
    } else if (!isWordConnectedToPreviousTile(cells, board)) {
      // TODO: Otherwise make sure the tiles are placed next to a previous tile
      console.log(
        "At least one tile in the word must be placed next to a previous tile"
      );
      return false;
    }

    // Check more than one cell has been played
    if (cells.length === 0) {
      console.log("Invalid word none played");
      return false;
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
      return false;
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
      return false;
    }

    // Must be either horizontal or vertical placement
    if (!isValidHorizontalPlacement && !isValidVerticalPlacement) {
      console.log("Invalid horizontal word");
      return false;
    }

    return true;
  }

  function returnTile(tile: Tile) {
    setBoard((prev) => removeTileFromBoard(tile, prev));
    returnPlayerTile(tile);
  }

  function returnAllPlayerTiles() {
    const tiles = removePlayerTilesFromBoard(board);
    returnPlayerTiles(tiles);
    setBoard(state.board.cells);
  }

  function isTileOnCell(row: number, col: number) {
    return getTileAtLocation(board, row, col) !== null;
  }

  function isTilePlayed(tile: Tile) {
    return isTileOnBoard(tile, board);
  }

  async function validateWordDefinitions(
    words: WordOnBoard[]
  ): Promise<boolean> {
    return await fetch("http://localhost:8080/v1/dictionary/validate", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ words: words.map((word) => word.word) }),
    })
      .then((response) => {
        console.log("RESPONSE:", response);
        if (response.ok) {
          return true;
        } else {
          return false;
        }
      })
      .catch(() => false);
  }

  function setWildLetter(tileId: string, letter: string) {
    setWildLetters((prev) => prev.set(tileId, letter));
  }

  function removeWildLetter(tileId: string) {
    setWildLetters((prev) => {
      prev.delete(tileId);
      return prev;
    });
  }

  function getWildLetter(tileId: string): string {
    return wildLetters.get(tileId) ?? "";
  }

  const contextData = {
    board,
    playTile,
    returnTile,
    returnAllPlayerTiles,
    isTileOnCell,
    isTilePlayed,
    playedCells,
    playedWords,
    isValidLetterPlacement,
    isValidDefinitions,
    potentialPoints,
    setWildLetter,
    removeWildLetter,
    getWildLetter,
  };

  return (
    <BoardContext.Provider value={contextData}>
      {children}
    </BoardContext.Provider>
  );
};

export default BoardContext;
