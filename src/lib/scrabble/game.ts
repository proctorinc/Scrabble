import {
  BINGO_BONUS,
  BOARD_SIZE,
  CENTER_INDEX,
  RACK_SIZE,
  STANDARD_SCRABBLE_BONUSES,
  createTileBag,
} from "@/lib/scrabble/constants";
import { createId, shuffleArray } from "@/lib/utils";
import {
  BoardCell,
  CpuDecision,
  DraftPlacement,
  GameLogEntry,
  GameState,
  LocalGameConfig,
  Player,
  Tile,
  ValidationMarker,
  ValidationResult,
  WordScore,
} from "@/types/game";

type Position = { row: number; col: number };

const AXES = {
  horizontal: { row: 0, col: 1 },
  vertical: { row: 1, col: 0 },
} as const;

export function createBoard(): BoardCell[][] {
  return STANDARD_SCRABBLE_BONUSES.map((row, rowIndex) =>
    row.map((bonus, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      bonus,
      tile: null,
      tileOwnerId: null,
    })),
  );
}

function cloneBoard(board: BoardCell[][]) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function clonePlayers(players: Player[]) {
  return players.map((player) => ({
    ...player,
    rack: [...player.rack],
  }));
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    bag: [...state.bag],
    players: clonePlayers(state.players),
    draft: state.draft.map((placement) => ({
      ...placement,
      tile: { ...placement.tile },
    })),
    logs: [...state.logs],
    selectedTradeTileIds: [...state.selectedTradeTileIds],
    handoff: state.handoff ? { ...state.handoff } : null,
    endgame: { ...state.endgame },
  };
}

function drawTiles(bag: Tile[], count: number) {
  const nextBag = [...bag];
  const drawn = nextBag.splice(0, count);
  return { bag: nextBag, drawn };
}

function createInitialEndgameState() {
  return {
    isFinalTurnPending: false,
    finalTurnPlayerId: null,
  };
}

function makeStartLog(playerId: string): GameLogEntry {
  return {
    id: createId("log"),
    playerId,
    action: "start",
    summary: "Started a local game",
    createdAt: Date.now(),
  };
}

export function createInitialGame(random = Math.random): GameState {
  return createConfiguredGame(
    {
      players: [
        { name: "Player 1", kind: "human-local" },
        { name: "Player 2", kind: "human-local" },
      ],
    },
    random,
  );
}

export function createConfiguredGame(
  config: LocalGameConfig,
  random = Math.random,
): GameState {
  const shuffledBag = shuffleArray(createTileBag(), random);
  const playerOneDraw = drawTiles(shuffledBag, RACK_SIZE);
  const playerTwoDraw = drawTiles(playerOneDraw.bag, RACK_SIZE);
  const players: Player[] = [
    {
      id: "player-1",
      name: config.players[0].name,
      kind: config.players[0].kind,
      score: 0,
      rack: playerOneDraw.drawn,
      cpuConfig: config.players[0].cpuConfig,
    },
    {
      id: "player-2",
      name: config.players[1].name,
      kind: config.players[1].kind,
      score: 0,
      rack: playerTwoDraw.drawn,
      cpuConfig: config.players[1].cpuConfig,
    },
  ];

  return {
    id: createId("game"),
    status: "active",
    board: createBoard(),
    bag: playerTwoDraw.bag,
    players,
    currentPlayerIndex: 0,
    draft: [],
    logs: [makeStartLog(players[0].id)],
    selectedTradeTileIds: [],
    handoff: null,
    winnerId: null,
    turn: 1,
    endgame: createInitialEndgameState(),
  };
}

export function createIdleGame(): GameState {
  const game = createInitialGame();

  return {
    ...game,
    status: "idle",
    logs: [],
  };
}

function getCurrentPlayer(state: GameState) {
  return state.players[state.currentPlayerIndex];
}

function getNextPlayerIndex(state: GameState) {
  return (state.currentPlayerIndex + 1) % state.players.length;
}

function boardHasCommittedTiles(board: BoardCell[][]) {
  return board.some((row) => row.some((cell) => cell.tile !== null));
}

function getDraftPlacement(state: GameState, tileId: string) {
  return state.draft.find((placement) => placement.tile.id === tileId);
}

function getDraftAtPosition(state: GameState, row: number, col: number) {
  return state.draft.find(
    (placement) => placement.row === row && placement.col === col,
  );
}

function getDraftAtPositionFromList(
  draft: DraftPlacement[],
  row: number,
  col: number,
) {
  return draft.find(
    (placement) => placement.row === row && placement.col === col,
  );
}

function removeTileFromRack(rack: Tile[], tileId: string) {
  const index = rack.findIndex((tile) => tile.id === tileId);

  if (index === -1) {
    return { rack, tile: null };
  }

  const nextRack = [...rack];
  const [tile] = nextRack.splice(index, 1);
  return { rack: nextRack, tile };
}

function insertTileIntoRack(rack: Tile[], tile: Tile, index?: number) {
  const nextRack = [...rack];
  const boundedIndex =
    typeof index === "number"
      ? Math.max(0, Math.min(index, nextRack.length))
      : nextRack.length;
  nextRack.splice(
    boundedIndex,
    0,
    tile.isBlank ? { ...tile, letter: "" } : tile,
  );
  return nextRack;
}

function commitDraftToBoard(
  board: BoardCell[][],
  draft: DraftPlacement[],
  playerId: string,
) {
  const nextBoard = cloneBoard(board);

  draft.forEach((placement) => {
    nextBoard[placement.row][placement.col].tile = { ...placement.tile };
    nextBoard[placement.row][placement.col].tileOwnerId = playerId;
  });

  return nextBoard;
}

function getTileAt(
  board: BoardCell[][],
  draft: DraftPlacement[],
  row: number,
  col: number,
) {
  const draftTile = draft.find(
    (placement) => placement.row === row && placement.col === col,
  );

  if (draftTile) {
    return draftTile.tile;
  }

  return board[row]?.[col]?.tile ?? null;
}

function extendWord(
  board: BoardCell[][],
  draft: DraftPlacement[],
  start: Position,
  axis: { row: number; col: number },
) {
  let row = start.row;
  let col = start.col;

  while (
    row - axis.row >= 0 &&
    col - axis.col >= 0 &&
    row - axis.row < BOARD_SIZE &&
    col - axis.col < BOARD_SIZE &&
    getTileAt(board, draft, row - axis.row, col - axis.col)
  ) {
    row -= axis.row;
    col -= axis.col;
  }

  const cells: Array<{
    row: number;
    col: number;
    tile: Tile;
    bonus: BoardCell["bonus"];
    isDraft: boolean;
  }> = [];

  while (row >= 0 && col >= 0 && row < BOARD_SIZE && col < BOARD_SIZE) {
    const tile = getTileAt(board, draft, row, col);

    if (!tile) {
      break;
    }

    cells.push({
      row,
      col,
      tile,
      bonus: board[row][col].bonus,
      isDraft: Boolean(getDraftAtPositionFromList(draft, row, col)),
    });

    row += axis.row;
    col += axis.col;
  }

  return cells;
}

function calculateWordScore(
  cells: Array<{
    row: number;
    col: number;
    tile: Tile;
    bonus: BoardCell["bonus"];
    isDraft: boolean;
  }>,
): WordScore {
  let points = 0;
  let wordMultiplier = 1;

  cells.forEach((cell) => {
    let tilePoints = cell.tile.value;

    if (cell.isDraft && cell.bonus === "DL") {
      tilePoints *= 2;
    } else if (cell.isDraft && cell.bonus === "TL") {
      tilePoints *= 3;
    }

    if (cell.isDraft && cell.bonus === "DW") {
      wordMultiplier *= 2;
    } else if (cell.isDraft && cell.bonus === "TW") {
      wordMultiplier *= 3;
    }

    points += tilePoints;
  });

  return {
    word: cells
      .map((cell) => (cell.tile.isBlank ? cell.tile.letter : cell.tile.letter))
      .join(""),
    points: points * wordMultiplier,
    cells: cells.map((cell) => ({ row: cell.row, col: cell.col })),
  };
}

function getOrientation(draft: DraftPlacement[]) {
  if (draft.length <= 1) {
    return null;
  }

  const sameRow = draft.every((placement) => placement.row === draft[0].row);
  const sameCol = draft.every((placement) => placement.col === draft[0].col);

  if (!sameRow && !sameCol) {
    return "invalid";
  }

  return sameRow ? "horizontal" : "vertical";
}

function hasNoGaps(
  board: BoardCell[][],
  draft: DraftPlacement[],
  orientation: "horizontal" | "vertical",
) {
  const rows = draft.map((placement) => placement.row);
  const cols = draft.map((placement) => placement.col);

  if (orientation === "horizontal") {
    const row = rows[0];
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    for (let col = minCol; col <= maxCol; col += 1) {
      if (!getTileAt(board, draft, row, col)) {
        return false;
      }
    }
  } else {
    const col = cols[0];
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);

    for (let row = minRow; row <= maxRow; row += 1) {
      if (!getTileAt(board, draft, row, col)) {
        return false;
      }
    }
  }

  return true;
}

function touchesCenter(draft: DraftPlacement[]) {
  return draft.some(
    (placement) =>
      placement.row === CENTER_INDEX && placement.col === CENTER_INDEX,
  );
}

function touchesCommittedTile(board: BoardCell[][], draft: DraftPlacement[]) {
  return draft.some((placement) => {
    const neighbors: Position[] = [
      { row: placement.row - 1, col: placement.col },
      { row: placement.row + 1, col: placement.col },
      { row: placement.row, col: placement.col - 1 },
      { row: placement.row, col: placement.col + 1 },
    ];

    return neighbors.some(({ row, col }) => {
      if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE) {
        return false;
      }

      return board[row][col].tile !== null;
    });
  });
}

function makeCellsKey(cells: Array<{ row: number; col: number }>) {
  return cells.map((cell) => `${cell.row}-${cell.col}`).join("|");
}

function getAnchorCell(cells: Array<{ row: number; col: number }>) {
  return cells.reduce((anchor, cell) => {
    if (
      cell.row < anchor.row ||
      (cell.row === anchor.row && cell.col > anchor.col)
    ) {
      return cell;
    }

    return anchor;
  });
}

function makeMarker(
  tone: ValidationMarker["tone"],
  message: string,
  cells: Array<{ row: number; col: number }>,
  extras?: Pick<ValidationMarker, "word" | "points">,
): ValidationMarker {
  const key = makeCellsKey(cells);

  return {
    id: `${tone}-${key}`,
    tone,
    message,
    cells,
    anchor: getAnchorCell(cells),
    ...extras,
  };
}

function findWords(board: BoardCell[][], draft: DraftPlacement[]) {
  const orientation = getOrientation(draft);

  if (orientation === "invalid") {
    return {
      reason: "Tiles must be in one row or one column.",
      words: [] as WordScore[],
    };
  }

  const activeOrientation =
    orientation ??
    (draft.some((placement) => {
      const horizontal =
        extendWord(board, draft, placement, AXES.horizontal).length > 1;
      const vertical =
        extendWord(board, draft, placement, AXES.vertical).length > 1;
      return horizontal && !vertical;
    })
      ? "horizontal"
      : "vertical");

  if (draft.length > 1 && !hasNoGaps(board, draft, activeOrientation)) {
    return {
      reason: "Tiles must form one continuous word.",
      words: [] as WordScore[],
    };
  }

  if (!boardHasCommittedTiles(board) && !touchesCenter(draft)) {
    return {
      reason: "The opening play must cover the center star.",
      words: [] as WordScore[],
    };
  }

  if (
    boardHasCommittedTiles(board) &&
    !touchesCommittedTile(board, draft) &&
    draft.length > 0
  ) {
    return {
      reason: "Your play has to connect to tiles already on the board.",
      words: [] as WordScore[],
    };
  }

  const uniqueWords = new Map<string, WordScore>();

  if (draft.length > 0) {
    const primaryCells = extendWord(
      board,
      draft,
      draft[0],
      activeOrientation === "horizontal" ? AXES.horizontal : AXES.vertical,
    );

    if (primaryCells.length <= 1) {
      return {
        reason: "You need to make a valid word.",
        words: [] as WordScore[],
      };
    }

    const primaryScore = calculateWordScore(primaryCells);
    uniqueWords.set(makeCellsKey(primaryScore.cells), primaryScore);
  }

  draft.forEach((placement) => {
    const crossCells = extendWord(
      board,
      draft,
      placement,
      activeOrientation === "horizontal" ? AXES.vertical : AXES.horizontal,
    );

    if (crossCells.length > 1) {
      const crossScore = calculateWordScore(crossCells);
      uniqueWords.set(makeCellsKey(crossScore.cells), crossScore);
    }
  });

  return { words: Array.from(uniqueWords.values()) };
}

export function validateDraft(
  state: GameState,
  dictionary: Set<string>,
): ValidationResult {
  if (state.draft.length === 0) {
    return {
      isValid: false,
      reason: "Place at least one tile before you play.",
      words: [],
      totalPoints: 0,
      markers: [],
    };
  }

  const blankPlacements = state.draft.filter(
    (placement) => placement.tile.isBlank && placement.tile.letter === "",
  );

  if (blankPlacements.length > 0) {
    const blankCells = blankPlacements.map(({ row, col }) => ({ row, col }));
    return {
      isValid: false,
      reason: "Choose a letter for the blank tile first.",
      words: [],
      totalPoints: 0,
      markers: [
        makeMarker(
          "error",
          "Choose a letter for the blank tile first.",
          blankCells,
        ),
      ],
    };
  }

  const found = findWords(state.board, state.draft);

  if ("reason" in found && found.reason) {
    return {
      isValid: false,
      reason: found.reason,
      words: [],
      totalPoints: 0,
      markers: [
        makeMarker(
          "error",
          found.reason,
          state.draft.map(({ row, col }) => ({ row, col })),
        ),
      ],
    };
  }

  const invalidWord = found.words.find(
    (word) => !dictionary.has(word.word.toLowerCase()),
  );

  if (invalidWord) {
    const invalidWordMessage = `"${invalidWord.word}" is not a valid word.`;
    return {
      isValid: false,
      reason: invalidWordMessage,
      words: found.words,
      totalPoints: found.words.reduce((total, word) => total + word.points, 0),
      markers: [
        makeMarker("error", invalidWordMessage, invalidWord.cells, {
          word: invalidWord.word,
          points: invalidWord.points,
        }),
      ],
    };
  }

  let totalPoints = found.words.reduce((total, word) => total + word.points, 0);

  if (state.draft.length === RACK_SIZE) {
    totalPoints += BINGO_BONUS;
  }

  const primaryWord = found.words[0];

  return {
    isValid: true,
    words: found.words,
    totalPoints,
    markers: [
      makeMarker(
        "success",
        `This play scores ${totalPoints} point${totalPoints === 1 ? "" : "s"} total.`,
        primaryWord.cells,
        {
          word: primaryWord.word,
          points: totalPoints,
        },
      ),
    ],
  };
}

export function placeRackTile(
  state: GameState,
  tileId: string,
  row: number,
  col: number,
) {
  const next = cloneState(state);
  const player = getCurrentPlayer(next);

  if (next.board[row][col].tile || getDraftAtPosition(next, row, col)) {
    return next;
  }

  const removed = removeTileFromRack(player.rack, tileId);

  if (!removed.tile) {
    return next;
  }

  player.rack = removed.rack;
  next.draft.push({ row, col, tile: removed.tile });
  next.selectedTradeTileIds = [];
  return next;
}

export function moveDraftTile(
  state: GameState,
  tileId: string,
  row: number,
  col: number,
) {
  const next = cloneState(state);
  const draft = getDraftPlacement(next, tileId);

  if (!draft || next.board[row][col].tile) {
    return next;
  }

  const existingDraft = getDraftAtPosition(next, row, col);

  if (existingDraft && existingDraft.tile.id !== tileId) {
    return next;
  }

  draft.row = row;
  draft.col = col;
  return next;
}

export function returnDraftTileToRack(
  state: GameState,
  tileId: string,
  index?: number,
) {
  const next = cloneState(state);
  const player = getCurrentPlayer(next);
  const draftIndex = next.draft.findIndex(
    (placement) => placement.tile.id === tileId,
  );

  if (draftIndex === -1) {
    return next;
  }

  const [placement] = next.draft.splice(draftIndex, 1);
  player.rack = insertTileIntoRack(player.rack, placement.tile, index);
  return next;
}

export function returnAllDraftTiles(state: GameState) {
  return state.draft.reduce(
    (current, placement) => returnDraftTileToRack(current, placement.tile.id),
    cloneState(state),
  );
}

export function reorderRack(state: GameState, tileId: string, index: number) {
  const next = cloneState(state);
  const player = getCurrentPlayer(next);
  const currentIndex = player.rack.findIndex((tile) => tile.id === tileId);

  if (currentIndex === -1) {
    return next;
  }

  const [tile] = player.rack.splice(currentIndex, 1);
  const boundedIndex = Math.max(0, Math.min(index, player.rack.length));
  player.rack.splice(boundedIndex, 0, tile);
  return next;
}

export function shuffleRack(state: GameState, random = Math.random) {
  const next = cloneState(state);
  const player = getCurrentPlayer(next);
  player.rack = shuffleArray(player.rack, random);
  return next;
}

export function toggleTradeSelection(state: GameState, tileId: string) {
  const next = cloneState(state);

  if (next.selectedTradeTileIds.includes(tileId)) {
    next.selectedTradeTileIds = next.selectedTradeTileIds.filter(
      (id) => id !== tileId,
    );
  } else {
    next.selectedTradeTileIds.push(tileId);
  }

  return next;
}

export function clearTradeSelection(state: GameState) {
  const next = cloneState(state);
  next.selectedTradeTileIds = [];
  return next;
}

function addLog(
  next: GameState,
  entry: Omit<GameLogEntry, "id" | "createdAt">,
) {
  next.logs.unshift({
    ...entry,
    id: createId("log"),
    createdAt: Date.now(),
  });
}

function finalizeTurn(next: GameState, reason: "play" | "trade" | "pass") {
  const currentPlayer = getCurrentPlayer(next);
  const nextPlayerIndex = getNextPlayerIndex(next);
  next.currentPlayerIndex = nextPlayerIndex;
  next.turn += 1;
  const nextPlayer = next.players[nextPlayerIndex];

  if (
    currentPlayer.kind === "human-local" &&
    nextPlayer.kind === "human-local"
  ) {
    next.handoff = {
      nextPlayerId: nextPlayer.id,
      reason,
    };
    next.status = "handoff";
  } else {
    next.handoff = null;
    next.status = "active";
  }

  next.selectedTradeTileIds = [];
}

function scoreRemainingRack(player: Player) {
  return player.rack.reduce((total, tile) => total + tile.value, 0);
}

function completeGame(next: GameState, winnerId: string) {
  const winner = next.players.find((player) => player.id === winnerId);

  if (!winner) {
    return;
  }

  next.status = "completed";
  next.handoff = null;
  next.winnerId = winner.id;
  next.selectedTradeTileIds = [];
  next.endgame = createInitialEndgameState();

  addLog(next, {
    playerId: winner.id,
    action: "win",
    summary: `${winner.name} wins with ${winner.score} points.`,
  });
}

export function forfeitGame(state: GameState) {
  const next = cloneState(state);
  const forfeitingPlayer = getCurrentPlayer(next);
  const winner = next.players[getNextPlayerIndex(next)];

  if (!winner) {
    return next;
  }

  next.draft = [];
  next.selectedTradeTileIds = [];
  next.handoff = null;
  next.status = "completed";
  next.winnerId = winner.id;
  next.endgame = createInitialEndgameState();

  addLog(next, {
    playerId: winner.id,
    action: "win",
    summary: `${forfeitingPlayer.name} forfeited. ${winner.name} wins by forfeit.`,
  });

  return next;
}

function completeGameByHighScore(next: GameState) {
  const [playerOne, playerTwo] = next.players;
  completeGame(
    next,
    playerOne.score >= playerTwo.score ? playerOne.id : playerTwo.id,
  );
}

function applyRackClearEndgameScoring(next: GameState) {
  const currentPlayer = getCurrentPlayer(next);
  const opponent = next.players[getNextPlayerIndex(next)];
  const opponentPenalty = scoreRemainingRack(opponent);
  currentPlayer.score += opponentPenalty;
  opponent.score -= opponentPenalty;
  completeGame(
    next,
    currentPlayer.score >= opponent.score ? currentPlayer.id : opponent.id,
  );
}

function startFinalTurn(next: GameState) {
  next.endgame = {
    isFinalTurnPending: true,
    finalTurnPlayerId: next.players[getNextPlayerIndex(next)]?.id ?? null,
  };
}

function shouldCompleteAfterCurrentTurn(next: GameState) {
  return (
    next.endgame.isFinalTurnPending &&
    next.endgame.finalTurnPlayerId === getCurrentPlayer(next).id
  );
}

export function submitMove(state: GameState, dictionary: Set<string>) {
  const next = cloneState(state);
  const validation = validateDraft(next, dictionary);

  if (!validation.isValid) {
    return { state: next, validation };
  }

  const player = getCurrentPlayer(next);
  next.board = commitDraftToBoard(next.board, next.draft, player.id);
  player.score += validation.totalPoints;
  next.draft = [];

  const refill = drawTiles(next.bag, RACK_SIZE - player.rack.length);
  next.bag = refill.bag;
  player.rack = [...player.rack, ...refill.drawn];

  addLog(next, {
    playerId: player.id,
    action: "play",
    summary: `${player.name} played ${validation.words.map((word) => word.word).join(", ")} for ${validation.totalPoints} points.`,
    words: validation.words.map((word) => word.word),
    points: validation.totalPoints,
  });

  if (next.bag.length === 0 && player.rack.length === 0) {
    applyRackClearEndgameScoring(next);
    return { state: next, validation };
  }

  if (shouldCompleteAfterCurrentTurn(next)) {
    completeGameByHighScore(next);
    return { state: next, validation };
  }

  if (state.bag.length > 0 && next.bag.length === 0) {
    startFinalTurn(next);
  }

  finalizeTurn(next, "play");
  return { state: next, validation };
}

export function tradeTiles(state: GameState, random = Math.random) {
  const next = cloneState(state);
  const player = getCurrentPlayer(next);
  const selectedIds = new Set(next.selectedTradeTileIds);

  if (
    next.draft.length > 0 ||
    selectedIds.size === 0 ||
    next.bag.length < selectedIds.size
  ) {
    return next;
  }

  const keptTiles: Tile[] = [];
  const returningTiles: Tile[] = [];

  player.rack.forEach((tile) => {
    if (selectedIds.has(tile.id)) {
      returningTiles.push(tile.isBlank ? { ...tile, letter: "" } : tile);
    } else {
      keptTiles.push(tile);
    }
  });

  const shuffledBag = shuffleArray([...next.bag, ...returningTiles], random);
  const refill = drawTiles(shuffledBag, returningTiles.length);

  player.rack = [...keptTiles, ...refill.drawn];
  next.bag = refill.bag;

  addLog(next, {
    playerId: player.id,
    action: "trade",
    summary: `${player.name} traded ${returningTiles.length} tiles.`,
  });

  if (shouldCompleteAfterCurrentTurn(next)) {
    completeGameByHighScore(next);
    return next;
  }

  finalizeTurn(next, "trade");
  return next;
}

export function passTurn(state: GameState) {
  const next = returnAllDraftTiles(state);
  const player = getCurrentPlayer(next);

  addLog(next, {
    playerId: player.id,
    action: "pass",
    summary: `${player.name} passed.`,
  });

  if (shouldCompleteAfterCurrentTurn(next)) {
    completeGameByHighScore(next);
    return next;
  }

  finalizeTurn(next, "pass");
  return next;
}

export function advanceHandoff(state: GameState) {
  const next = cloneState(state);

  if (next.status === "handoff") {
    next.status = "active";
    next.handoff = null;
  }

  return next;
}

export function setBlankTileLetter(
  state: GameState,
  tileId: string,
  letter: string,
) {
  const next = cloneState(state);
  const draft = getDraftPlacement(next, tileId);

  if (draft && draft.tile.isBlank) {
    draft.tile.letter = letter.toUpperCase();
  }

  return next;
}

export function getVisibleBoard(state: GameState) {
  return state.board.map((row) =>
    row.map((cell) => ({
      ...cell,
      tile: getDraftAtPosition(state, cell.row, cell.col)?.tile ?? cell.tile,
    })),
  );
}

export function getTileCounts(tiles: Tile[]) {
  return tiles.reduce<Record<string, number>>((counts, tile) => {
    const letter = tile.isBlank ? "" : tile.letter;
    counts[letter] = (counts[letter] ?? 0) + 1;
    return counts;
  }, {});
}

export function applyCpuDecision(
  state: GameState,
  decision: CpuDecision,
  dictionary: Set<string>,
) {
  if (decision.type === "play") {
    const next = cloneState(state);
    const player = getCurrentPlayer(next);
    const draft: DraftPlacement[] = [];

    for (const placement of decision.placements) {
      const removed = removeTileFromRack(player.rack, placement.tile.id);

      if (!removed.tile) {
        return state;
      }

      player.rack = removed.rack;
      draft.push({
        row: placement.row,
        col: placement.col,
        tile: { ...placement.tile },
      });
    }

    next.draft = draft;
    return submitMove(next, dictionary).state;
  }

  if (decision.type === "trade") {
    return tradeTiles({
      ...state,
      selectedTradeTileIds: decision.tileIds,
    });
  }

  return passTurn(state);
}
