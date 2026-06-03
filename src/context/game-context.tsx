"use client";

import {
  DragCancelEvent,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { resolveCpuTurn } from "@/lib/scrabble/cpu";
import {
  advanceHandoff,
  clearTradeSelection,
  createConfiguredGame,
  createIdleGame,
  getTileCounts,
  getVisibleBoard,
  passTurn,
  placeRackTile,
  reorderRack,
  returnAllDraftTiles,
  returnDraftTileToRack,
  forfeitGame as forfeitGameState,
  setBlankTileLetter,
  shuffleRack,
  submitMove,
  toggleTradeSelection,
  tradeTiles,
  validateDraft,
  moveDraftTile,
} from "@/lib/scrabble/game";
import { createLocalTwoPlayerConfig } from "@/lib/scrabble/setup";
import {
  DictionarySearchResult,
  DictionaryState,
  GameState,
  LocalGameConfig,
  Player,
  ValidationResult,
} from "@/types/game";
import { getPlayerTint, PlayerTint } from "@/lib/player-colors";

type DragMeta =
  | { source: "rack"; tileId: string; rackIndex: number }
  | { source: "board"; tileId: string; row: number; col: number };

type DropMeta =
  | { target: "board"; row: number; col: number }
  | { target: "rack"; rackIndex: number };

type TurnBurst = {
  id: string;
  playerId: string;
  action: "play" | "trade" | "pass";
  points?: number;
};

type AnimationPhase = "idle" | "score-burst";

type ScoreBurstTransition = {
  burst: TurnBurst;
  displayGame: GameState;
  finalGame: GameState;
};

type TileAnimation = {
  playedTileIds: string[];
  shuffledRackTileIds: string[];
  playedSequence: number;
  shuffleSequence: number;
};

type GameContextValue = {
  game: GameState;
  hasSavedGame: boolean;
  isStorageHydrated: boolean;
  board: ReturnType<typeof getVisibleBoard>;
  draftValidation: ValidationResult | null;
  validationMessage: string | null;
  dictionary: DictionaryState;
  activeTab: "log" | "tiles" | "define";
  blankTileId: string | null;
  dragTileId: string | null;
  animationPhase: AnimationPhase;
  isScoreCelebrationActive: boolean;
  isCpuTurnInProgress: boolean;
  isInteractionLocked: boolean;
  lastPlayedTileIds: string[];
  playedTileAnimationIds: string[];
  shuffledRackTileIds: string[];
  playedTileAnimationSequence: number;
  shuffledRackAnimationSequence: number;
  defineSearch: DictionarySearchResult;
  startLocalGame: (config?: LocalGameConfig) => void;
  submitCurrentMove: () => void;
  returnTiles: () => void;
  returnTileToTray: (tileId: string) => void;
  shuffleCurrentRack: () => void;
  selectTradeTile: (tileId: string) => void;
  clearTradeTiles: () => void;
  confirmTrade: () => void;
  passCurrentTurn: () => void;
  forfeitGame: () => void;
  continueFromHandoff: () => void;
  chooseBlankLetter: (letter: string) => void;
  closeBlankPicker: () => void;
  searchDictionary: (query: string) => void;
  setActiveTab: (tab: "log" | "tiles" | "define") => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragCancel: (event: DragCancelEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  tileCounts: Record<string, number>;
  currentPlayer: GameState["players"][number];
  rackPlayer: GameState["players"][number];
  opponent: GameState["players"][number];
  scoreCelebration: TurnBurst | null;
  playedTilesUsePlayerColors: boolean;
  togglePlayedTilesUsePlayerColors: () => void;
  getPlayerTileTint: (playerId?: Player["id"] | null) => PlayerTint;
};

const GameContext = createContext<GameContextValue | null>(null);
const LOCAL_STORAGE_GAME_KEY = "scrabble.local-game";
const LOCAL_STORAGE_GAME_HISTORY_KEY = "scrabble.game-history";

type HistoricalGameRecord = {
  archivedAt: number;
  game: GameState;
};

function isOngoingGame(status: GameState["status"]) {
  return status === "active" || status === "handoff";
}

function archiveHistoricalGame(game: GameState) {
  const rawHistory = window.localStorage.getItem(LOCAL_STORAGE_GAME_HISTORY_KEY);
  const history = rawHistory
    ? (JSON.parse(rawHistory) as HistoricalGameRecord[])
    : [];

  if (history.some((entry) => entry.game.id === game.id)) {
    return;
  }

  window.localStorage.setItem(
    LOCAL_STORAGE_GAME_HISTORY_KEY,
    JSON.stringify([{ archivedAt: Date.now(), game }, ...history]),
  );
}

const EMPTY_DICTIONARY: DictionaryState = {
  ready: false,
  words: new Set(),
  list: [],
};

function parseDictionary(text: string) {
  const list = text
    .split(/\r?\n/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);

  return {
    ready: true,
    list,
    words: new Set(list),
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState>(() => createIdleGame());
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const [dictionary, setDictionary] =
    useState<DictionaryState>(EMPTY_DICTIONARY);
  const [activeTab, setActiveTab] = useState<"log" | "tiles" | "define">("log");
  const [blankTileId, setBlankTileId] = useState<string | null>(null);
  const [dragTileId, setDragTileId] = useState<string | null>(null);
  const [isCpuTurnInProgress, setIsCpuTurnInProgress] = useState(false);
  const [playedTilesUsePlayerColors, setPlayedTilesUsePlayerColors] =
    useState(false);
  const [animationPhase, setAnimationPhase] =
    useState<AnimationPhase>("idle");
  const [scoreCelebration, setScoreCelebration] =
    useState<TurnBurst | null>(null);
  const [tileAnimation, setTileAnimation] = useState<TileAnimation>({
    playedTileIds: [],
    shuffledRackTileIds: [],
    playedSequence: 0,
    shuffleSequence: 0,
  });
  const [lastPlayedTileIds, setLastPlayedTileIds] = useState<string[]>([]);
  const [defineSearch, setDefineSearch] = useState<DictionarySearchResult>({
    query: "",
    matches: [],
  });
  const cpuTurnTimeoutRef = useRef<number | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const playedTileAnimationTimeoutRef = useRef<number | null>(null);
  const rackShuffleAnimationTimeoutRef = useRef<number | null>(null);
  const gameRef = useRef(game);

  useEffect(() => {
    let restoredGame: GameState | null = null;

    try {
      const rawGame = window.localStorage.getItem(LOCAL_STORAGE_GAME_KEY);

      if (!rawGame) {
        queueMicrotask(() => {
          setIsStorageHydrated(true);
        });
        return;
      }

      const parsedGame = JSON.parse(rawGame) as Partial<GameState>;

      if (parsedGame.status && parsedGame.board && parsedGame.players) {
        restoredGame = {
          ...(parsedGame as GameState),
          endgame: parsedGame.endgame ?? {
            isFinalTurnPending: false,
            finalTurnPlayerId: null,
          },
        };
      } else {
        window.localStorage.removeItem(LOCAL_STORAGE_GAME_KEY);
      }
    } catch {
      window.localStorage.removeItem(LOCAL_STORAGE_GAME_KEY);
    }

    queueMicrotask(() => {
      if (restoredGame) {
        gameRef.current = restoredGame;
        setGame(restoredGame);
      }

      setIsStorageHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) {
      return;
    }

    if (game.status === "idle") {
      window.localStorage.removeItem(LOCAL_STORAGE_GAME_KEY);
      return;
    }

    if (game.status === "completed") {
      archiveHistoricalGame(game);
      window.localStorage.removeItem(LOCAL_STORAGE_GAME_KEY);
      return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_GAME_KEY, JSON.stringify(game));
  }, [game, isStorageHydrated]);

  useEffect(() => {
    let cancelled = false;

    fetch("/dictionary.txt")
      .then((response) => response.text())
      .then((text) => {
        if (!cancelled) {
          setDictionary(parseDictionary(text));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDictionary({
            ready: true,
            list: [],
            words: new Set(),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const board = useMemo(() => getVisibleBoard(game), [game]);
  const hasSavedGame = isOngoingGame(game.status);
  const currentPlayer = game.players[game.currentPlayerIndex];
  const rackPlayer = useMemo(() => {
    const humanPlayers = game.players.filter(
      (player) => player.kind === "human-local",
    );
    const hasComputerOpponent = game.players.some(
      (player) => player.kind === "computer",
    );

    if (humanPlayers.length === 1 && hasComputerOpponent) {
      return humanPlayers[0];
    }

    return currentPlayer;
  }, [currentPlayer, game.players]);
  const opponent =
    game.players[(game.currentPlayerIndex + 1) % game.players.length];
  const tileCounts = useMemo(() => getTileCounts(game.bag), [game.bag]);
  const isScoreCelebrationActive = animationPhase === "score-burst";
  const isInteractionLocked =
    game.status !== "active" ||
    isScoreCelebrationActive ||
    isCpuTurnInProgress ||
    currentPlayer.kind === "computer";
  const draftValidation = useMemo(() => {
    if (!dictionary.ready || game.draft.length === 0) {
      return null;
    }

    return validateDraft(game, dictionary.words);
  }, [dictionary, game]);
  const validationMessage = useMemo(() => {
    if (!draftValidation || draftValidation.isValid) {
      return null;
    }

    return draftValidation.reason ?? "That move is invalid.";
  }, [draftValidation]);

  function buildScoreBurstTransition(
    previous: GameState,
    next: GameState,
  ): ScoreBurstTransition | null {
    const previousLogId = previous.logs[0]?.id ?? null;
    const latestLog = next.logs[0];

    if (!latestLog || latestLog.id === previousLogId) {
      return null;
    }

    if (
      latestLog.action !== "play" &&
      latestLog.action !== "trade" &&
      latestLog.action !== "pass"
    ) {
      return null;
    }

    if (
      latestLog.action === "play" &&
      (!latestLog.points || latestLog.points <= 0)
    ) {
      return null;
    }

    return {
      burst: {
        id: latestLog.id,
        playerId: latestLog.playerId,
        action: latestLog.action,
        points: latestLog.points,
      },
      displayGame: {
        ...next,
        currentPlayerIndex: previous.currentPlayerIndex,
        status: "active",
        handoff: null,
        turn: previous.turn,
        winnerId: next.status === "completed" ? null : next.winnerId,
      },
      finalGame: next,
    };
  }

  function clearPlayedTileAnimation() {
    if (playedTileAnimationTimeoutRef.current !== null) {
      window.clearTimeout(playedTileAnimationTimeoutRef.current);
      playedTileAnimationTimeoutRef.current = null;
    }

    setTileAnimation((current) =>
      current.playedTileIds.length === 0
        ? current
        : { ...current, playedTileIds: [] },
    );
  }

  function clearRackShuffleAnimation() {
    if (rackShuffleAnimationTimeoutRef.current !== null) {
      window.clearTimeout(rackShuffleAnimationTimeoutRef.current);
      rackShuffleAnimationTimeoutRef.current = null;
    }

    setTileAnimation((current) =>
      current.shuffledRackTileIds.length === 0
        ? current
        : { ...current, shuffledRackTileIds: [] },
    );
  }

  function buildPlayedTileAnimation(previous: GameState, next: GameState) {
    const previousLogId = previous.logs[0]?.id ?? null;
    const latestLog = next.logs[0];

    if (
      !latestLog ||
      latestLog.id === previousLogId ||
      latestLog.action !== "play"
    ) {
      return [];
    }

    const newCells = next.board
      .flatMap((row) => row)
      .filter((cell) => {
        const previousCell = previous.board[cell.row]?.[cell.col];
        return (
          previousCell?.tile === null &&
          cell.tile !== null &&
          cell.tileOwnerId === latestLog.playerId
        );
      });

    if (newCells.length <= 1) {
      return newCells.map((cell) => cell.tile!.id);
    }

    const allSameRow = newCells.every((cell) => cell.row === newCells[0].row);
    const allSameCol = newCells.every((cell) => cell.col === newCells[0].col);

    newCells.sort((left, right) => {
      if (allSameRow) {
        return left.col - right.col;
      }

      if (allSameCol) {
        return left.row - right.row;
      }

      return left.row - right.row || left.col - right.col;
    });

    return newCells.map((cell) => cell.tile!.id);
  }

  function triggerPlayedTileAnimation(tileIds: string[]) {
    clearPlayedTileAnimation();

    if (tileIds.length === 0) {
      return;
    }

    setTileAnimation((current) => ({
      ...current,
      playedTileIds: tileIds,
      playedSequence: current.playedSequence + 1,
    }));
    playedTileAnimationTimeoutRef.current = window.setTimeout(() => {
      setTileAnimation((current) => ({ ...current, playedTileIds: [] }));
      playedTileAnimationTimeoutRef.current = null;
    }, 900);
  }

  function triggerRackShuffleAnimation(tileIds: string[]) {
    clearRackShuffleAnimation();

    if (tileIds.length === 0) {
      return;
    }

    setTileAnimation((current) => ({
      ...current,
      shuffledRackTileIds: tileIds,
      shuffleSequence: current.shuffleSequence + 1,
    }));
    rackShuffleAnimationTimeoutRef.current = window.setTimeout(() => {
      setTileAnimation((current) => ({ ...current, shuffledRackTileIds: [] }));
      rackShuffleAnimationTimeoutRef.current = null;
    }, 700);
  }

  function commitGame(next: GameState, previous = gameRef.current) {
    const playedTileIds = buildPlayedTileAnimation(previous, next);
    triggerPlayedTileAnimation(playedTileIds);
    if (playedTileIds.length > 0) {
      setLastPlayedTileIds(playedTileIds);
    }
    const scoreBurstTransition = buildScoreBurstTransition(previous, next);

    if (!scoreBurstTransition) {
      gameRef.current = next;
      setGame(next);
      return;
    }

    if (celebrationTimeoutRef.current !== null) {
      window.clearTimeout(celebrationTimeoutRef.current);
    }

    gameRef.current = scoreBurstTransition.finalGame;
    setAnimationPhase("score-burst");
    setScoreCelebration(scoreBurstTransition.burst);
    setGame(scoreBurstTransition.displayGame);

    celebrationTimeoutRef.current = window.setTimeout(() => {
      gameRef.current = scoreBurstTransition.finalGame;
      setGame(scoreBurstTransition.finalGame);
      setScoreCelebration(null);
      setAnimationPhase("idle");
      celebrationTimeoutRef.current = null;
    }, 1600);
  }

  const commitGameEvent = useEffectEvent(
    (next: GameState, previous: GameState) => {
      commitGame(next, previous);
    },
  );

  function startLocalGame(
    config: LocalGameConfig = createLocalTwoPlayerConfig(),
  ) {
    if (isOngoingGame(gameRef.current.status)) {
      return;
    }

    const nextGame = createConfiguredGame(config);
    if (cpuTurnTimeoutRef.current !== null) {
      window.clearTimeout(cpuTurnTimeoutRef.current);
      cpuTurnTimeoutRef.current = null;
    }
    if (celebrationTimeoutRef.current !== null) {
      window.clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
    clearPlayedTileAnimation();
    clearRackShuffleAnimation();
    gameRef.current = nextGame;
    setGame(nextGame);
    setBlankTileId(null);
    setIsCpuTurnInProgress(false);
    setAnimationPhase("idle");
    setScoreCelebration(null);
    setLastPlayedTileIds([]);
    setActiveTab("log");
  }

  function submitCurrentMove() {
    if (!dictionary.ready || isInteractionLocked) {
      return;
    }

    const result = submitMove(game, dictionary.words);
    commitGame(result.state, game);
  }

  function returnTiles() {
    if (isInteractionLocked) {
      return;
    }
    commitGame(returnAllDraftTiles(game), game);
  }

  function returnTileToTray(tileId: string) {
    if (isInteractionLocked) {
      return;
    }

    commitGame(returnDraftTileToRack(game, tileId), game);
  }

  function shuffleCurrentRack() {
    if (isInteractionLocked) {
      return;
    }
    const next = shuffleRack(game);
    triggerRackShuffleAnimation(
      next.players[next.currentPlayerIndex].rack.map((tile) => tile.id),
    );
    commitGame(next, game);
  }

  function selectTradeTile(tileId: string) {
    if (isInteractionLocked) {
      return;
    }
    commitGame(toggleTradeSelection(game, tileId), game);
  }

  function clearTradeTiles() {
    commitGame(clearTradeSelection(game), game);
  }

  function confirmTrade() {
    if (isInteractionLocked) {
      return;
    }
    commitGame(tradeTiles(game), game);
  }

  function passCurrentTurn() {
    if (isInteractionLocked) {
      return;
    }
    commitGame(passTurn(game), game);
  }

  function forfeitGame() {
    if (isInteractionLocked) {
      return;
    }

    commitGame(forfeitGameState(game), game);
  }

  function continueFromHandoff() {
    commitGame(advanceHandoff(game), game);
  }

  function chooseBlankLetter(letter: string) {
    if (!blankTileId || isInteractionLocked) {
      return;
    }

    commitGame(setBlankTileLetter(game, blankTileId, letter), game);
    setBlankTileId(null);
  }

  function closeBlankPicker() {
    if (!blankTileId || isInteractionLocked) {
      return;
    }

    commitGame(returnDraftTileToRack(game, blankTileId), game);
    setBlankTileId(null);
  }

  function searchDictionary(query: string) {
    const normalized = query.trim().toLowerCase();

    if (!normalized || !dictionary.ready) {
      setDefineSearch({ query, matches: [] });
      return;
    }

    const matches = dictionary.list
      .filter((word) => word.startsWith(normalized))
      .slice(0, 50);
    setDefineSearch({ query, matches });
  }

  function togglePlayedTilesUsePlayerColors() {
    setPlayedTilesUsePlayerColors((current) => !current);
  }

  function onDragStart(event: DragStartEvent) {
    if (isInteractionLocked) {
      return;
    }

    const data = event.active.data.current as DragMeta | undefined;
    setDragTileId(data?.tileId ?? null);
  }

  function onDragCancel(_event: DragCancelEvent) {
    setDragTileId(null);
  }

  function onDragEnd(event: DragEndEvent) {
    setDragTileId(null);
    if (isInteractionLocked) {
      return;
    }

    const active = event.active.data.current as DragMeta | undefined;
    const over = event.over?.data.current as DropMeta | undefined;

    if (!active || !over) {
      return;
    }

    let next = game;

    if (active.source === "rack" && over.target === "board") {
      next = placeRackTile(game, active.tileId, over.row, over.col);
      const placed = next.draft.find(
        (placement) => placement.tile.id === active.tileId,
      );

      if (placed?.tile.isBlank) {
        setBlankTileId(active.tileId);
      }

      commitGame(next, game);
      return;
    }

    if (active.source === "board" && over.target === "board") {
      next = moveDraftTile(game, active.tileId, over.row, over.col);
      commitGame(next, game);
      return;
    }

    if (active.source === "board" && over.target === "rack") {
      next = returnDraftTileToRack(game, active.tileId, over.rackIndex);
      commitGame(next, game);
      return;
    }

    if (active.source === "rack" && over.target === "rack") {
      next = reorderRack(game, active.tileId, over.rackIndex);
      commitGame(next, game);
      return;
    }
  }

  useEffect(() => {
    if (
      !dictionary.ready ||
      game.status !== "active" ||
      currentPlayer.kind !== "computer" ||
      blankTileId ||
      isScoreCelebrationActive ||
      cpuTurnTimeoutRef.current !== null
    ) {
      return;
    }

    setIsCpuTurnInProgress(true);
    cpuTurnTimeoutRef.current = window.setTimeout(() => {
      cpuTurnTimeoutRef.current = null;
      const current = gameRef.current;
      const next = resolveCpuTurn(current, dictionary.list, dictionary.words);
      commitGameEvent(next, current);
      setIsCpuTurnInProgress(false);
    }, 850);

    return () => {
      if (cpuTurnTimeoutRef.current !== null) {
        window.clearTimeout(cpuTurnTimeoutRef.current);
        cpuTurnTimeoutRef.current = null;
        setIsCpuTurnInProgress(false);
      }
    };
  }, [
    blankTileId,
    currentPlayer.kind,
    dictionary,
    game.status,
    game.turn,
    isScoreCelebrationActive,
  ]);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current !== null) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
      if (playedTileAnimationTimeoutRef.current !== null) {
        window.clearTimeout(playedTileAnimationTimeoutRef.current);
      }
      if (rackShuffleAnimationTimeoutRef.current !== null) {
        window.clearTimeout(rackShuffleAnimationTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    game,
    hasSavedGame,
    isStorageHydrated,
    board,
    draftValidation,
    validationMessage,
    dictionary,
    activeTab,
    blankTileId,
    dragTileId,
    animationPhase,
    isScoreCelebrationActive,
    isCpuTurnInProgress,
    isInteractionLocked,
    lastPlayedTileIds,
    playedTileAnimationIds: tileAnimation.playedTileIds,
    shuffledRackTileIds: tileAnimation.shuffledRackTileIds,
    playedTileAnimationSequence: tileAnimation.playedSequence,
    shuffledRackAnimationSequence: tileAnimation.shuffleSequence,
    defineSearch,
    startLocalGame,
    submitCurrentMove,
    returnTiles,
    returnTileToTray,
    shuffleCurrentRack,
    selectTradeTile,
    clearTradeTiles,
    confirmTrade,
    passCurrentTurn,
    forfeitGame,
    continueFromHandoff,
    chooseBlankLetter,
    closeBlankPicker,
    searchDictionary,
    setActiveTab,
    onDragStart,
    onDragCancel,
    onDragEnd,
    tileCounts,
    currentPlayer,
    rackPlayer,
    opponent,
    scoreCelebration,
    playedTilesUsePlayerColors,
    togglePlayedTilesUsePlayerColors,
    getPlayerTileTint: (playerId?: Player["id"] | null) =>
      getPlayerTint(game.players, playerId),
  } satisfies GameContextValue;

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}
