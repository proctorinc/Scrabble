import { Bonus, Tile } from "@/types/game";
import { createId } from "@/lib/utils";

export const BOARD_SIZE = 15;
export const RACK_SIZE = 7;
export const CENTER_INDEX = 7;
export const BINGO_BONUS = 50;

export const STANDARD_SCRABBLE_BONUSES: Bonus[][] = [
  ["TW", "", "", "TL", "", "", "", "TW", "", "", "", "TL", "", "", "TW"],
  ["", "DW", "", "", "", "TL", "", "", "", "TL", "", "", "", "DW", ""],
  ["", "", "DW", "", "", "", "DL", "", "DL", "", "", "", "DW", "", ""],
  ["DL", "", "", "DW", "", "", "", "DL", "", "", "", "DW", "", "", "DL"],
  ["", "", "", "", "DW", "", "", "", "", "", "DW", "", "", "", ""],
  ["", "TL", "", "", "", "TL", "", "", "", "TL", "", "", "", "TL", ""],
  ["", "", "DL", "", "", "", "DL", "", "DL", "", "", "", "DL", "", ""],
  ["TW", "", "", "DL", "", "", "", "DW", "", "", "", "DL", "", "", "TW"],
  ["", "", "DL", "", "", "", "DL", "", "DL", "", "", "", "DL", "", ""],
  ["", "TL", "", "", "", "TL", "", "", "", "TL", "", "", "", "TL", ""],
  ["", "", "", "", "DW", "", "", "", "", "", "DW", "", "", "", ""],
  ["DL", "", "", "DW", "", "", "", "DL", "", "", "", "DW", "", "", "DL"],
  ["", "", "DW", "", "", "", "DL", "", "DL", "", "", "", "DW", "", ""],
  ["", "DW", "", "", "", "TL", "", "", "", "TL", "", "", "", "DW", ""],
  ["TW", "", "", "TL", "", "", "", "TW", "", "", "", "TL", "", "", "TW"],
];

const TILE_DISTRIBUTION: Array<{ letter: string; value: number; count: number; isBlank?: boolean }> = [
  { letter: "A", value: 1, count: 9 },
  { letter: "B", value: 3, count: 2 },
  { letter: "C", value: 3, count: 2 },
  { letter: "D", value: 2, count: 4 },
  { letter: "E", value: 1, count: 12 },
  { letter: "F", value: 4, count: 2 },
  { letter: "G", value: 2, count: 3 },
  { letter: "H", value: 4, count: 2 },
  { letter: "I", value: 1, count: 9 },
  { letter: "J", value: 8, count: 1 },
  { letter: "K", value: 5, count: 1 },
  { letter: "L", value: 1, count: 4 },
  { letter: "M", value: 3, count: 2 },
  { letter: "N", value: 1, count: 6 },
  { letter: "O", value: 1, count: 8 },
  { letter: "P", value: 3, count: 2 },
  { letter: "Q", value: 10, count: 1 },
  { letter: "R", value: 1, count: 6 },
  { letter: "S", value: 1, count: 4 },
  { letter: "T", value: 1, count: 6 },
  { letter: "U", value: 1, count: 4 },
  { letter: "V", value: 4, count: 2 },
  { letter: "W", value: 4, count: 2 },
  { letter: "X", value: 8, count: 1 },
  { letter: "Y", value: 4, count: 2 },
  { letter: "Z", value: 10, count: 1 },
  { letter: "", value: 0, count: 2, isBlank: true },
];

export const TOTAL_TILE_COUNT = TILE_DISTRIBUTION.reduce(
  (total, entry) => total + entry.count,
  0,
);

export function createTileBag() {
  const bag: Tile[] = [];

  TILE_DISTRIBUTION.forEach((entry) => {
    for (let count = 0; count < entry.count; count += 1) {
      bag.push({
        id: createId("tile"),
        letter: entry.letter,
        value: entry.value,
        isBlank: Boolean(entry.isBlank),
      });
    }
  });

  return bag;
}
