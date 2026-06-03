import { Player } from "@/types/game";

export type PlayerTint = "neutral" | "blue" | "rose" | "gold";

const PLAYER_TINTS: PlayerTint[] = ["blue", "rose", "gold"];

export function getPlayerTint(
  players: Player[],
  playerId?: string | null,
): PlayerTint {
  if (!playerId) {
    return "neutral";
  }

  const playerIndex = players.findIndex((player) => player.id === playerId);
  return PLAYER_TINTS[playerIndex] ?? "neutral";
}
