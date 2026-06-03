"use client";

import { Badge } from "@/components/ui/badge";
import { useGame } from "@/context/game-context";
import { TOTAL_TILE_COUNT } from "@/lib/scrabble/constants";
import { cn } from "@/lib/utils";

export function MobileTitleBar() {
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
  const latestTurn = game.logs.find((log) => log.action !== "start") ?? null;
  const lastTurnSummary = latestTurn
    ? latestTurn.summary
    : "Opening turn. No plays have been scored yet.";
  const isTurnActive = game.status === "active" || game.status === "handoff";
  const highlightedPlayerId =
    isScoreCelebrationActive && scoreCelebration
      ? scoreCelebration.playerId
      : currentPlayer.id;
  const isLeftActive = isTurnActive && highlightedPlayerId === leftPlayer.id;
  const isRightActive = isTurnActive && highlightedPlayerId === rightPlayer.id;
  const remainingTiles = game.bag.length;
  const tileProgress = Math.max(
    0,
    Math.min(1, remainingTiles / TOTAL_TILE_COUNT),
  );
  const tileRingStyle = {
    background: `conic-gradient(var(--player-gold) ${tileProgress * 360}deg, rgba(124, 88, 68, 0.12) 0deg)`,
  };

  return (
    <div
      id="mobile-top-bar"
      className="flex w-full flex-col items-center justify-end lg:hidden"
    >
      <div className="flex w-full flex-col gap-4 bg-transparent px-4 py-4 sm:max-w-xl sm:rounded-[28px] sm:border sm:border-panel sm:bg-card sm:px-4 sm:py-3 sm:shadow-[var(--shadow-brutal-md)]">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-3">
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <span className="px-2 text-3xl leading-none font-semibold text-display">
              {leftPlayer.score}
            </span>
            <Badge
              variant="rose"
              className={cn(
                "max-w-full gap-1 truncate text-[0.65rem] sm:text-xs",
                isLeftActive && "ring-2 ring-player-rose/25",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full bg-player-rose/35",
                  isLeftActive &&
                    "bg-player-rose shadow-[0_0_0_3px_rgba(107,51,44,0.14)]",
                )}
              />
              <span className="truncate">{leftLabel}</span>
            </Badge>
          </div>
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full p-[3px] sm:h-12 sm:w-12"
              style={tileRingStyle}
              aria-label={`${remainingTiles} of ${TOTAL_TILE_COUNT} tiles left in the bag`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-soft text-[0.7rem] font-bold text-display shadow-[var(--shadow-inset-soft)] sm:text-xs">
                {remainingTiles}
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-end gap-1.5 text-right">
            <span className="px-2 text-3xl leading-none font-semibold text-display">
              {rightPlayer.score}
            </span>
            <Badge
              variant="blue"
              className={cn(
                "max-w-full gap-1 truncate text-[0.65rem] sm:text-xs",
                isRightActive && "ring-2 ring-player-blue/25",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full bg-player-blue/35",
                  isRightActive &&
                    "bg-player-blue shadow-[0_0_0_3px_rgba(37,75,96,0.14)]",
                )}
              />
              <span className="truncate">{rightLabel}</span>
            </Badge>
          </div>
          <div className="col-span-3 rounded-[22px] bg-surface-chip px-4 py-3 text-center text-xs leading-tight text-emphasis shadow-[var(--shadow-inset-soft)] sm:px-4 sm:py-2 sm:text-sm">
            <span className="font-medium">
              {game.status === "completed"
                ? "Game complete."
                : isScoreCelebrationActive && scoreCelebration
                  ? scoreCelebration.action === "play"
                    ? `+${scoreCelebration.points} points.`
                    : scoreCelebration.action === "trade"
                      ? "Swapped tiles."
                      : "Passed turn."
                  : isCpuTurnInProgress && currentPlayer.kind === "computer"
                    ? `${leftLabel} is thinking...`
                    : lastTurnSummary}
            </span>
          </div>
          {/*<div className="col-span-3 flex justify-center">
            <Button
              type="button"
              size="sm"
              variant={playedTilesUsePlayerColors ? "secondary" : "outline"}
              onClick={togglePlayedTilesUsePlayerColors}
              aria-pressed={playedTilesUsePlayerColors}
              className="min-w-[13rem]"
            >
              Player tile colors {playedTilesUsePlayerColors ? "on" : "off"}
            </Button>
          </div>*/}
        </div>
      </div>
    </div>
  );
}
