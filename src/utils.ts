import { BoardCells, Cell, CellWithTile, Tile, WordOnBoard } from "./types";

export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  let currentIndex = copy.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [copy[currentIndex], copy[randomIndex]] = [
      copy[randomIndex],
      copy[currentIndex],
    ];
  }

  return copy;
}

export function addTileToBoard(
  tile: Tile,
  board: BoardCells,
  row: number,
  col: number
): BoardCells {
  const copy = [...board];
  copy[row][col].tile = tile;

  return copy;
}

export function removeTileFromBoard(tile: Tile, board: BoardCells): BoardCells {
  const copy = [...board];
  copy.map((row, i) => {
    row.map((cell, j) => {
      const boardTile = cell.tile;
      if (boardTile !== null && boardTile.id === tile.id) {
        copy[i][j].tile = null;
      }
    });
  });

  return copy;
}

export function isTileOnBoard(tile: Tile, board: BoardCells) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const boardTile = board[i][j].tile;
      if (boardTile !== null && boardTile.id == tile.id) {
        return true;
      }
    }
  }

  return false;
}

export function removePlayerTilesFromBoard(board: BoardCells): Tile[] {
  const tiles: Tile[] = [];
  board.map((row, i) => {
    row.map((cell, j) => {
      const tile = cell.tile;
      if (tile !== null && tile.in_play) {
        tiles.push(tile);
        board[i][j].tile = null;
      }
    });
  });

  return tiles;
}

export function getTileAtLocation(
  board: BoardCells,
  row: number,
  col: number
): Tile | null {
  return board[row][col].tile;
}

export function getCellsWithInPlayTiles(board: BoardCells): CellWithTile[] {
  const cells: CellWithTile[] = [];

  board.map((row) => {
    row.map((cell) => {
      if (cell.tile !== null && cell.tile.in_play) {
        cells.push(cell as CellWithTile);
      }
    });
  });

  return cells;
}

export function areHorizontalLettersConnected(
  cells: Cell[],
  board: BoardCells
) {
  let inPlayCount = 0;
  let currentCell = cells[0];
  let done = false;

  while (!done) {
    if (currentCell.tile !== null && currentCell.tile.in_play) {
      inPlayCount++;
    }

    // Check board right boundary
    if (currentCell.col < board[0].length - 1) {
      currentCell = board[currentCell.row][currentCell.col + 1];
      if (currentCell.tile === null) {
        done = true;
      }
    } else {
      done = true;
    }
  }

  return inPlayCount === cells.length;
}

export function areVerticalLettersConnected(cells: Cell[], board: BoardCells) {
  let inPlayCount = 0;
  let currentCell = cells[0];
  let done = false;

  while (!done) {
    if (currentCell.tile !== null && currentCell.tile.in_play) {
      inPlayCount++;
    }

    // Check board right boundary
    if (currentCell.row < board[0].length - 1) {
      currentCell = board[currentCell.row + 1][currentCell.col];
      if (currentCell.tile === null) {
        done = true;
      }
    } else {
      done = true;
    }
  }

  return inPlayCount === cells.length;
}

export function isFirstTurn(board: BoardCells) {
  return board.every((row) =>
    row.every((cell) => cell.tile === null || cell.tile.in_play)
  );
}

export function isTileOnCenterOfTheBoard(board: BoardCells) {
  return board[7][7].tile !== null;
}

export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}

export function hasAdjacentTileNotInPlay(
  cell: CellWithTile,
  board: BoardCells
): boolean {
  if (
    cell.row > 0 &&
    board[cell.row - 1][cell.col].tile !== null &&
    !board[cell.row - 1][cell.col].tile?.in_play
  ) {
    // Check top
    return true;
  } else if (
    cell.row < board.length - 1 &&
    board[cell.row + 1][cell.col].tile !== null &&
    !board[cell.row + 1][cell.col].tile?.in_play
  ) {
    // Check bottom
    return true;
  } else if (
    cell.col > 0 &&
    board[cell.row][cell.col - 1].tile !== null &&
    !board[cell.row][cell.col - 1].tile?.in_play
  ) {
    // Check left
    return true;
  } else if (
    cell.col < board[0].length - 1 &&
    board[cell.row][cell.col + 1].tile !== null &&
    !board[cell.row][cell.col + 1].tile?.in_play
  ) {
    // Check right
    return true;
  }

  return false;
}

export function isWordConnectedToPreviousTile(
  cells: CellWithTile[],
  board: BoardCells
) {
  return cells.some((cell) => hasAdjacentTileNotInPlay(cell, board));
}

function hasHorizontalAdjacentCell(
  cell: CellWithTile,
  board: BoardCells
): boolean {
  if (
    cell.col + 1 < board[0].length &&
    board[cell.row][cell.col + 1].tile !== null
  ) {
    return true;
  } else if (cell.col - 1 >= 0 && board[cell.row][cell.col - 1].tile !== null) {
    return true;
  }

  return false;
}

export function getPlayedWords(
  cells: CellWithTile[],
  board: BoardCells
): WordOnBoard[] {
  const isHorizontal =
    (cells.length == 1 && hasHorizontalAdjacentCell(cells[0], board)) ||
    (cells.length > 1 && cells[0].row == cells[1].row);
  let playedWords: WordOnBoard[] = [];

  console.log("adjacent:", hasHorizontalAdjacentCell(cells[0], board));
  console.log("is horizontal", isHorizontal);

  if (isHorizontal) {
    playedWords = getHorizontalPlayedWords(cells, board);
  } else {
    playedWords = getVerticalPlayedWords(cells, board);
  }

  return playedWords;
}

function getHorizontalPlayedWords(
  cells: CellWithTile[],
  board: BoardCells
): WordOnBoard[] {
  const mainWordCells = getHorizontalWordCells(cells[0], board);
  const mainWord = getWordFromCells(mainWordCells);
  const playedWords: WordOnBoard[] = [mainWord];

  mainWordCells.map((cell) => {
    if (cell.tile.in_play) {
      const verticalCells = getVerticalWordCells(cell, board);

      if (verticalCells.length > 1) {
        const word = getWordFromCells(verticalCells);
        playedWords.push(word);
      }
    }
  });

  return playedWords;
}

function getVerticalPlayedWords(
  cells: CellWithTile[],
  board: BoardCells
): WordOnBoard[] {
  const mainWordCells = getVerticalWordCells(cells[0], board);
  const mainWord = getWordFromCells(mainWordCells);
  const playedWords: WordOnBoard[] = [mainWord];

  mainWordCells.map((cell) => {
    if (cell.tile.in_play) {
      const verticalCells = getHorizontalWordCells(cell, board);

      if (verticalCells.length > 1) {
        const word = getWordFromCells(verticalCells);
        playedWords.push(word);
      }
    }
  });

  return playedWords;
}

function getHorizontalWordCells(
  startingCell: CellWithTile,
  board: BoardCells
): CellWithTile[] {
  let currentCell = startingCell;
  const cells = [startingCell];

  while (currentCell.tile != null && currentCell.col + 1 < board[0].length) {
    currentCell = board[currentCell.row][currentCell.col + 1] as CellWithTile;

    if (currentCell.tile != null) {
      cells.push(currentCell);
    }
  }

  currentCell = startingCell;

  while (currentCell.tile != null && currentCell.col - 1 >= 0) {
    currentCell = board[currentCell.row][currentCell.col - 1] as CellWithTile;

    if (currentCell.tile != null) {
      cells.unshift(currentCell);
    }
  }

  return cells;
}

function getVerticalWordCells(
  startingCell: CellWithTile,
  board: BoardCells
): CellWithTile[] {
  let currentCell = startingCell;
  const cells = [startingCell];

  while (currentCell.tile != null && currentCell.row + 1 < board.length) {
    currentCell = board[currentCell.row + 1][currentCell.col] as CellWithTile;

    if (currentCell.tile != null) {
      cells.push(currentCell);
    }
  }

  currentCell = startingCell;

  while (currentCell.tile != null && currentCell.row - 1 >= 0) {
    currentCell = board[currentCell.row - 1][currentCell.col] as CellWithTile;

    if (currentCell.tile != null) {
      cells.unshift(currentCell);
    }
  }

  return cells;
}

function getWordFromCells(cells: CellWithTile[]): WordOnBoard {
  let points = 0;
  let doubleWordBonus = 0;
  let tripleWordBonus = 0;
  const word: string[] = [];

  cells.map((cell) => {
    word.push(cell.tile.letter);
    points += calculateCellPoints(cell);

    if (cell.tile.in_play && cell.bonus === "DW") {
      doubleWordBonus += 1;
    } else if (cell.tile.in_play && cell.bonus === "TW") {
      tripleWordBonus += 1;
    }
  });

  if (doubleWordBonus > 0) {
    points *= 2 * doubleWordBonus;
  }

  if (tripleWordBonus > 0) {
    points *= 3 * tripleWordBonus;
  }

  return {
    word: word.join(""),
    cells,
    points,
  };
}

function calculateCellPoints(cell: CellWithTile): number {
  if (cell.tile.in_play && cell.bonus == "DL") {
    return cell.tile.value * 2;
  } else if (cell.tile.in_play && cell.bonus == "TL") {
    return cell.tile.value * 3;
  }

  return cell.tile.value;
}

export function getTotalPoints(playedWords: WordOnBoard[]): number {
  let totalPoints = playedWords.reduce((acc, word) => acc + word.points, 0);

  if (getNumberOfInPlayTiles(playedWords[0]) == 7) {
    totalPoints += 50;
  }

  return totalPoints;
}

function getNumberOfInPlayTiles(word: WordOnBoard): number {
  let count = 0;

  word.cells.forEach((cell) => {
    if (cell.tile.in_play) {
      count++;
    }
  });

  return count;
}

export const INITIAL_PLAYER_TILES: Tile[] = [
  { id: "1", letter: "B", in_play: true, value: 1 },
  { id: "2", letter: "A", in_play: true, value: 1 },
  { id: "3", letter: "N", in_play: true, value: 1 },
  { id: "4", letter: "A", in_play: true, value: 1 },
  { id: "5", letter: "N", in_play: true, value: 1 },
  { id: "6", letter: "A", in_play: true, value: 1 },
  { id: "7", letter: "S", in_play: true, value: 1 },
];

export const INITIAL_PLAYER_TWO_TILES: Tile[] = [
  { id: "21", letter: "T", in_play: true, value: 1 },
  { id: "22", letter: "X", in_play: true, value: 1 },
  { id: "23", letter: "E", in_play: true, value: 1 },
  { id: "24", letter: "A", in_play: true, value: 1 },
  { id: "25", letter: "J", in_play: true, value: 1 },
  { id: "26", letter: "L", in_play: true, value: 1 },
  { id: "27", letter: "M", in_play: true, value: 1 },
];

export const INITIAL_PLAYERS = [
  { id: "player-one", name: "Matt", score: 0, tiles: INITIAL_PLAYER_TILES },
  {
    id: "player-two",
    name: "Annika",
    score: 0,
    tiles: INITIAL_PLAYER_TWO_TILES,
  },
];
