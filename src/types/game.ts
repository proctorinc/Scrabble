export type Bonus = "" | "DL" | "DW" | "TL" | "TW";

export type PlayerKind = "human-local" | "guest-online" | "computer";

export type CpuDifficulty = "easy" | "medium" | "hard";

export type GameStatus = "idle" | "active" | "handoff" | "completed";

export type TurnAction = "start" | "play" | "trade" | "pass" | "win";

export type Player = {
  id: string;
  name: string;
  kind: PlayerKind;
  score: number;
  rack: Tile[];
  cpuConfig?: CpuConfig;
};

export type Tile = {
  id: string;
  letter: string;
  value: number;
  isBlank: boolean;
};

export type BoardCell = {
  row: number;
  col: number;
  bonus: Bonus;
  tile: Tile | null;
  tileOwnerId?: string | null;
};

export type DraftPlacement = {
  row: number;
  col: number;
  tile: Tile;
};

export type WordScore = {
  word: string;
  points: number;
  cells: Array<{ row: number; col: number }>;
};

export type ValidationTone = "success" | "error";

export type ValidationMarker = {
  id: string;
  tone: ValidationTone;
  message: string;
  cells: Array<{ row: number; col: number }>;
  anchor: { row: number; col: number };
  word?: string;
  points?: number;
};

export type GameLogEntry = {
  id: string;
  playerId: string;
  action: TurnAction;
  summary: string;
  words?: string[];
  points?: number;
  createdAt: number;
};

export type HandoffState = {
  reason: Exclude<TurnAction, "start" | "win">;
  nextPlayerId: string;
};

export type EndgameState = {
  isFinalTurnPending: boolean;
  finalTurnPlayerId: string | null;
};

export type GameState = {
  id: string;
  status: GameStatus;
  board: BoardCell[][];
  bag: Tile[];
  players: Player[];
  currentPlayerIndex: number;
  draft: DraftPlacement[];
  logs: GameLogEntry[];
  selectedTradeTileIds: string[];
  handoff: HandoffState | null;
  winnerId: string | null;
  turn: number;
  endgame: EndgameState;
};

export type CpuConfig = {
  difficulty: CpuDifficulty;
  maxKnownWordLength: number;
  candidateWordLimit: number;
  rankedChoiceIndex: number;
  rankedChoiceWindow: number;
  tradeBelowScore: number;
  tradeTileCount: number;
  heuristicWeights: {
    score: number;
    tilesUsed: number;
    rackBalance: number;
  };
};

export type LocalPlayerConfig = {
  name: string;
  kind: "human-local" | "computer";
  cpuConfig?: CpuConfig;
};

export type LocalGameConfig = {
  players: [LocalPlayerConfig, LocalPlayerConfig];
};

export type DictionaryState = {
  ready: boolean;
  words: Set<string>;
  list: string[];
};

export type ValidationResult = {
  isValid: boolean;
  reason?: string;
  words: WordScore[];
  totalPoints: number;
  markers: ValidationMarker[];
};

export type SubmitMoveResult = {
  state: GameState;
  validation: ValidationResult;
};

export type DictionarySearchResult = {
  query: string;
  matches: string[];
};

export type CpuPlayDecision = {
  type: "play";
  placements: DraftPlacement[];
  words: string[];
  score: number;
};

export type CpuTradeDecision = {
  type: "trade";
  tileIds: string[];
};

export type CpuPassDecision = {
  type: "pass";
};

export type CpuDecision = CpuPlayDecision | CpuTradeDecision | CpuPassDecision;
