import { BOARD_SIZE } from "@/lib/scrabble/constants";
import { applyCpuDecision, validateDraft } from "@/lib/scrabble/game";
import {
  CpuConfig,
  CpuDecision,
  CpuDifficulty,
  DraftPlacement,
  GameState,
  Tile,
} from "@/types/game";

const CPU_PRESETS: Record<CpuDifficulty, CpuConfig> = {
  easy: {
    difficulty: "easy",
    maxKnownWordLength: 4,
    candidateWordLimit: 1200,
    rankedChoiceIndex: 3,
    rankedChoiceWindow: 6,
    tradeBelowScore: 7,
    tradeTileCount: 4,
    heuristicWeights: {
      score: 1,
      tilesUsed: 0.4,
      rackBalance: 0.7,
    },
  },
  medium: {
    difficulty: "medium",
    maxKnownWordLength: 6,
    candidateWordLimit: 5000,
    rankedChoiceIndex: 1,
    rankedChoiceWindow: 4,
    tradeBelowScore: 4,
    tradeTileCount: 3,
    heuristicWeights: {
      score: 1.1,
      tilesUsed: 0.6,
      rackBalance: 0.5,
    },
  },
  hard: {
    difficulty: "hard",
    maxKnownWordLength: 8,
    candidateWordLimit: 12000,
    rankedChoiceIndex: 0,
    rankedChoiceWindow: 1,
    tradeBelowScore: 0,
    tradeTileCount: 2,
    heuristicWeights: {
      score: 1.25,
      tilesUsed: 0.75,
      rackBalance: 0.35,
    },
  },
};

type CandidateMove = {
  placements: DraftPlacement[];
  totalPoints: number;
  words: string[];
  heuristicScore: number;
};

export function getCpuConfig(difficulty: CpuDifficulty) {
  return CPU_PRESETS[difficulty];
}

function tileValueLookup(letter: string) {
  const map: Record<string, number> = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10,
  };

  return map[letter] ?? 0;
}

function getKnowledgeWords(
  dictionaryList: string[],
  rack: Tile[],
  cpuConfig: CpuConfig,
) {
  const availableLetters = new Set(
    rack.flatMap((tile) => (tile.isBlank ? [] : [tile.letter.toLowerCase()])),
  );

  return dictionaryList
    .filter(
      (word) => word.length >= 2 && word.length <= cpuConfig.maxKnownWordLength,
    )
    .filter((word) => {
      const uniqueLetters = new Set(word.split(""));
      return Array.from(uniqueLetters).some((letter) =>
        availableLetters.has(letter),
      );
    })
    .slice(0, cpuConfig.candidateWordLimit);
}

function findTileForLetter(tiles: Tile[], letter: string) {
  const exactIndex = tiles.findIndex(
    (tile) => !tile.isBlank && tile.letter === letter,
  );

  if (exactIndex >= 0) {
    const nextTiles = [...tiles];
    const [tile] = nextTiles.splice(exactIndex, 1);
    return { tile, remainingTiles: nextTiles };
  }

  const blankIndex = tiles.findIndex((tile) => tile.isBlank);

  if (blankIndex >= 0) {
    const nextTiles = [...tiles];
    const [tile] = nextTiles.splice(blankIndex, 1);
    return {
      tile: { ...tile, letter },
      remainingTiles: nextTiles,
    };
  }

  return null;
}

function buildPlacementsForWord(
  state: GameState,
  word: string,
  row: number,
  col: number,
  orientation: "horizontal" | "vertical",
) {
  const player = state.players[state.currentPlayerIndex];
  let remainingTiles = [...player.rack];
  const placements: DraftPlacement[] = [];
  let existingTiles = 0;

  for (let index = 0; index < word.length; index += 1) {
    const currentRow = orientation === "horizontal" ? row : row + index;
    const currentCol = orientation === "horizontal" ? col + index : col;
    const currentTile = state.board[currentRow][currentCol].tile;
    const letter = word[index].toUpperCase();

    if (currentTile) {
      if (currentTile.letter !== letter) {
        return null;
      }
      existingTiles += 1;
      continue;
    }

    const found = findTileForLetter(remainingTiles, letter);

    if (!found) {
      return null;
    }

    remainingTiles = found.remainingTiles;
    placements.push({
      row: currentRow,
      col: currentCol,
      tile: found.tile,
    });
  }

  if (placements.length === 0) {
    return null;
  }

  if (
    existingTiles === 0 &&
    state.board.some((boardRow) => boardRow.some((cell) => cell.tile !== null))
  ) {
    return null;
  }

  return placements;
}

function scoreRackLeave(remainingRack: Tile[]) {
  const vowels = remainingRack.filter((tile) =>
    "AEIOU".includes(tile.letter),
  ).length;
  const consonants = remainingRack.length - vowels;
  const balancePenalty = Math.abs(vowels - consonants);
  const highValuePenalty = remainingRack.reduce(
    (total, tile) => total + Math.max(tile.value - 3, 0),
    0,
  );
  const duplicatePenalty = remainingRack.reduce<Record<string, number>>(
    (counts, tile) => {
      const key = tile.isBlank ? "" : tile.letter;
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const duplicateScore = Object.values(duplicatePenalty).reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );

  return -(balancePenalty + highValuePenalty * 0.5 + duplicateScore * 1.5);
}

function scoreCandidateMove(
  state: GameState,
  placements: DraftPlacement[],
  totalPoints: number,
  cpuConfig: CpuConfig,
) {
  const usedTileIds = new Set(placements.map((placement) => placement.tile.id));
  const remainingRack = state.players[state.currentPlayerIndex].rack.filter(
    (tile) => !usedTileIds.has(tile.id),
  );

  return (
    totalPoints * cpuConfig.heuristicWeights.score +
    placements.length * cpuConfig.heuristicWeights.tilesUsed +
    scoreRackLeave(remainingRack) * cpuConfig.heuristicWeights.rackBalance
  );
}

function findCandidateMoves(
  state: GameState,
  dictionaryList: string[],
  cpuConfig: CpuConfig,
) {
  const knowledgeWords = getKnowledgeWords(
    dictionaryList,
    state.players[state.currentPlayerIndex].rack,
    cpuConfig,
  );
  const knowledgeSet = new Set(knowledgeWords);
  const candidates: CandidateMove[] = [];

  knowledgeWords.forEach((word) => {
    const upperWord = word.toUpperCase();

    (["horizontal", "vertical"] as const).forEach((orientation) => {
      const maxRow =
        orientation === "horizontal"
          ? BOARD_SIZE
          : BOARD_SIZE - upperWord.length + 1;
      const maxCol =
        orientation === "horizontal"
          ? BOARD_SIZE - upperWord.length + 1
          : BOARD_SIZE;

      for (let row = 0; row < maxRow; row += 1) {
        for (let col = 0; col < maxCol; col += 1) {
          const placements = buildPlacementsForWord(
            state,
            upperWord,
            row,
            col,
            orientation,
          );

          if (!placements) {
            continue;
          }

          const validation = validateDraft(
            {
              ...state,
              draft: placements,
            },
            knowledgeSet,
          );

          if (!validation.isValid) {
            continue;
          }

          candidates.push({
            placements,
            totalPoints: validation.totalPoints,
            words: validation.words.map((entry) => entry.word),
            heuristicScore: scoreCandidateMove(
              state,
              placements,
              validation.totalPoints,
              cpuConfig,
            ),
          });
        }
      }
    });
  });

  return candidates.sort((left, right) => {
    if (right.heuristicScore !== left.heuristicScore) {
      return right.heuristicScore - left.heuristicScore;
    }

    if (right.totalPoints !== left.totalPoints) {
      return right.totalPoints - left.totalPoints;
    }

    return right.placements.length - left.placements.length;
  });
}

function getTradeTileIds(state: GameState, cpuConfig: CpuConfig) {
  const rack = [...state.players[state.currentPlayerIndex].rack];
  const hasU = rack.some((tile) => tile.letter === "U");

  const ranked = rack
    .map((tile, index) => {
      let penalty = tile.value;

      if ("QJXZVK".includes(tile.letter)) {
        penalty += 3;
      }

      if (tile.letter === "Q" && !hasU) {
        penalty += 4;
      }

      const duplicates = rack.filter(
        (candidate) => candidate.letter === tile.letter,
      ).length;
      penalty += Math.max(0, duplicates - 1) * 2;

      if ("AEIOU".includes(tile.letter)) {
        penalty += 0.5;
      }

      return {
        tile,
        penalty,
        index,
      };
    })
    .sort(
      (left, right) => right.penalty - left.penalty || left.index - right.index,
    );

  return ranked
    .slice(
      0,
      Math.min(cpuConfig.tradeTileCount, state.bag.length, ranked.length),
    )
    .map((entry) => entry.tile.id);
}

export function chooseCpuMove(state: GameState, dictionaryList: string[]) {
  const player = state.players[state.currentPlayerIndex];

  if (player.kind !== "computer" || !player.cpuConfig) {
    return { type: "pass" } satisfies CpuDecision;
  }

  const candidates = findCandidateMoves(
    state,
    dictionaryList,
    player.cpuConfig,
  );
  const bestCandidate = candidates[0];

  if (bestCandidate) {
    const rankedWindow = candidates.slice(
      0,
      player.cpuConfig.rankedChoiceWindow,
    );
    const selectedIndex = Math.min(
      player.cpuConfig.rankedChoiceIndex,
      rankedWindow.length - 1,
    );
    const chosen = rankedWindow[selectedIndex];

    if (
      chosen.totalPoints > player.cpuConfig.tradeBelowScore ||
      state.bag.length < player.cpuConfig.tradeTileCount
    ) {
      return {
        type: "play",
        placements: chosen.placements,
        words: chosen.words,
        score: chosen.totalPoints,
      } satisfies CpuDecision;
    }
  }

  const tradeTileIds = getTradeTileIds(state, player.cpuConfig);

  if (tradeTileIds.length > 0 && state.bag.length >= tradeTileIds.length) {
    return {
      type: "trade",
      tileIds: tradeTileIds,
    } satisfies CpuDecision;
  }

  return {
    type: "pass",
  } satisfies CpuDecision;
}

export function resolveCpuTurn(
  state: GameState,
  dictionaryList: string[],
  dictionaryWords: Set<string>,
) {
  const player = state.players[state.currentPlayerIndex];

  if (player.kind !== "computer" || !player.cpuConfig) {
    return state;
  }

  const decision = chooseCpuMove(state, dictionaryList);
  return applyCpuDecision(state, decision, dictionaryWords);
}
