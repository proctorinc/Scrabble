import { BoardCells, Cell, CellWithTile, Tile } from "./types";

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

export function somethingCheckHorizontalWord(
  startingCell: CellWithTile,
  board: BoardCells
) {
  // Create two pointers, both equal to starting cell
  let left: Cell = startingCell;
  let right: Cell = startingCell;
  let leftDone = false;
  let rightDone = false;
  const word: Tile[] = [startingCell.tile];

  // Start at cell
  while (!rightDone || !leftDone) {
    // Check left edge
    if (left.col > 0) {
      const nextLeft = board[left.row][left.col - 1];

      if (nextLeft.tile !== null) {
        word.unshift(nextLeft.tile);
        left = nextLeft;

        // Check for a vertical word if tile was played by the user
        if (left.tile?.in_play) {
          // TODO: Check for vertical word
        }
      } else {
        leftDone = true;
      }
    } else {
      leftDone = true;
    }

    // Check right edge
    if (right.col < board[0].length - 1) {
      // word.push(right.tile);
      const nextRight = board[right.row][right.col + 1];

      if (nextRight.tile !== null) {
        word.push(nextRight.tile);
        right = nextRight;

        // Check for a vertical word if tile was played by the user
        if (right.tile?.in_play) {
          // TODO: Check for vertical word
        }
      } else {
        rightDone = true;
      }
    } else {
      rightDone = true;
    }
  }

  console.log("Word:", word.map((tile) => tile.letter).join(""));
}

export function somethingCheckVerticalWord(
  startingCell: CellWithTile,
  board: BoardCells
) {
  // Create two pointers, both equal to starting cell
  let top: Cell = startingCell;
  let bottom: Cell = startingCell;
  let topDone = false;
  let bottomDone = false;
  const word: Tile[] = [startingCell.tile];

  // Start at cell
  while (!topDone || !bottomDone) {
    // Check left edge
    if (top.col > 0) {
      const nextTop = board[top.row][top.col - 1];

      if (nextTop.tile !== null) {
        word.unshift(nextTop.tile);
        top = nextTop;

        // Check for a horizontal word if tile was played by the user
        if (top.tile?.in_play) {
          // TODO: Check for horiztonal word
        }
      } else {
        topDone = true;
      }
    } else {
      topDone = true;
    }

    // Check right edge
    if (bottom.col < board[0].length - 1) {
      // word.push(right.tile);
      const nextBottom = board[bottom.row + 1][bottom.col];

      if (nextBottom.tile !== null) {
        word.push(nextBottom.tile);
        bottom = nextBottom;

        // Check for a horizontal word if tile was played by the user
        if (bottom.tile?.in_play) {
          // TODO: Check for horizontal word
        }
      } else {
        bottomDone = true;
      }
    } else {
      bottomDone = true;
    }
  }

  console.log("Word:", word.map((tile) => tile.letter).join(""));
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
    console.log("VALID");
    console.log(board[cell.row + 1][cell.col].tile);
    // Check top
    return true;
  } else if (
    cell.row < board.length - 1 &&
    board[cell.row + 1][cell.col].tile !== null &&
    !board[cell.row + 1][cell.col].tile?.in_play
  ) {
    console.log("VALID");
    console.log(board[cell.row + 1][cell.col].tile);
    // Check bottom
    return true;
  } else if (
    cell.col > 0 &&
    board[cell.row][cell.col - 1].tile !== null &&
    !board[cell.row][cell.col - 1].tile?.in_play
  ) {
    console.log("VALID");
    console.log(board[cell.row + 1][cell.col].tile);
    // Check left
    return true;
  } else if (
    cell.col < board[0].length - 1 &&
    board[cell.row][cell.col + 1].tile !== null &&
    !board[cell.row][cell.col + 1].tile?.in_play
  ) {
    console.log("VALID");
    console.log(board[cell.row + 1][cell.col].tile);
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
