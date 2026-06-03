"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "@/context/game-context";

export function TitleBar() {
  const {
    currentPlayer,
    game,
    isScoreCelebrationActive,
    isCpuTurnInProgress,
    playedTilesUsePlayerColors,
    scoreCelebration,
    togglePlayedTilesUsePlayerColors,
  } = useGame();
  const leftPlayer = game.players[1];
  const rightPlayer = game.players[0];
  const leftLabel =
    leftPlayer.kind === "computer" && leftPlayer.cpuConfig
      ? `${leftPlayer.name} (${leftPlayer.cpuConfig.difficulty[0].toUpperCase()}${leftPlayer.cpuConfig.difficulty.slice(1)})`
      : leftPlayer.name;
  const rightLabel =
    rightPlayer.kind === "computer" && rightPlayer.cpuConfig
      ? `${rightPlayer.name} (${rightPlayer.cpuConfig.difficulty[0].toUpperCase()}${rightPlayer.cpuConfig.difficulty.slice(1)})`
      : rightPlayer.name;

  return (
    <Card className="flex w-full flex-col gap-4 p-4 xl:p-5">
      <div className="grid w-full grid-cols-2 items-start gap-3">
        <div className="flex min-w-0 flex-col items-start gap-1">
          <span className="text-3xl leading-none font-semibold text-display xl:text-4xl">
            {leftPlayer.score}
          </span>
          <Badge variant="rose" className="max-w-full truncate">
            {leftLabel}
          </Badge>
        </div>
        <div className="flex min-w-0 flex-col items-end gap-1 text-right">
          <span className="text-3xl leading-none font-semibold text-display xl:text-4xl">
            {rightPlayer.score}
          </span>
          <Badge variant="blue" className="max-w-full truncate">
            {rightLabel}
          </Badge>
        </div>
        <div className="col-span-2 rounded-full bg-surface-chip px-3 py-2 text-center text-sm leading-tight font-medium text-emphasis shadow-[var(--shadow-inset-soft)]">
          {game.status === "completed"
            ? "Game complete"
            : isScoreCelebrationActive && scoreCelebration
              ? scoreCelebration.action === "play"
                ? `+${scoreCelebration.points} points`
                : scoreCelebration.action === "trade"
                  ? "Swapped tiles"
                  : "Passed turn"
              : isCpuTurnInProgress && currentPlayer.kind === "computer"
                ? `${leftLabel} is thinking...`
                : `${currentPlayer.name}'s turn`}
        </div>
      </div>
    </Card>
  );
}
