export type Bonus = "DL" | "DW" | "TL" | "TW" | "";

export enum GameStatus {
  INVITE_PLAYERS = "invite-players",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export type BoardCells = Cell[][];

export type GameState = {
  id: string;
  status: GameStatus;
  is_local: boolean;
  board: {
    cells: BoardCells;
  };
  tile_bag: {
    tiles: Tile[];
  };
  players: GamePlayer[];
  player_turn: GamePlayer;
  current_player: GamePlayer;
};

export type Cell = {
  tile: Tile | null;
  bonus: Bonus;
  row: number;
  col: number;
};

export type CellWithTile = {
  tile: Tile;
  bonus: Bonus;
  row: number;
  col: number;
};

export type Tile = {
  id: string;
  letter: string;
  value: number;
  in_play: boolean;
};

export type GamePlayer = {
  id: string;
  alias: string;
  user: User;
  score: number;
  tiles: Tile[];
};

export type User = {
  id: string;
  username: string;
};

export enum GameMode {
  Online = "ONLINE",
  Local = "LOCAL",
}

export enum LogAction {
  JoinGame = "join_game",
  PlayTiles = "play-tiles",
  TradeTiles = "trade-tiles",
  SkipTurn = "skip-turn",
  QuitGame = "quit-game",
  WinGame = "win-game",
}

export type GameLog = {
  id: string;
  player: GamePlayer;
  action: LogAction;
  points_scored?: number;
  word_played?: string;
  num_tiles_traded?: number;
  date: Date;
};

export const ItemTypes = {
  Tile: "tile",
};
