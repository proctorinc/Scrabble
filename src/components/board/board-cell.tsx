"use client";

import { useDroppable } from "@dnd-kit/core";
import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import {
  BoardCell as BoardCellType,
  DraftPlacement,
  ValidationMarker,
  ValidationTone,
} from "@/types/game";
import { Tile } from "@/components/player/tile";
import { useGame } from "@/context/game-context";
import { cn } from "@/lib/utils";

const boardCellVariants = cva(
  "relative flex aspect-square w-full items-center justify-center overflow-visible rounded-[10px] border-2 border-board-strong/70 text-[0.7rem] font-bold shadow-[var(--shadow-board-cell)]",
  {
    variants: {
      bonus: {
        none: "bg-board-cell text-board-base",
        DL: "bg-board-cell-dl text-board-dl",
        DW: "bg-board-cell-dw text-board-dw",
        TL: "bg-board-cell-tl text-board-tl",
        TW: "bg-board-cell-tw text-board-tw",
      },
      highlightTone: {
        success: "ring-2 ring-success ring-offset-1 ring-offset-surface-chip",
        error:
          "ring-2 ring-error ring-offset-1 ring-offset-[color:rgba(255,244,242,0.95)]",
      },
      isOver: {
        true: "ring-2 ring-[color:var(--ring-strong)] ring-offset-1 ring-offset-surface-chip",
      },
    },
    defaultVariants: {
      bonus: "none",
    },
  },
);

const markerButtonVariants = cva(
  "absolute -right-2 -top-2 z-20 flex min-h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[0.6rem] font-black leading-none shadow-sm transition-transform hover:scale-105 sm:-right-2.5 sm:-top-2.5 sm:min-h-6 sm:min-w-6 sm:text-[0.65rem]",
  {
    variants: {
      tone: {
        error: "border-error-strong bg-error text-white",
        success: "border-success-strong bg-success text-white",
      },
    },
  },
);

export function BoardCell({
  cell,
  draftTile,
  highlightTone,
  markers,
  markerTone,
  isMarkerOpen,
  onToggleMarker,
}: {
  cell: BoardCellType;
  draftTile: DraftPlacement | undefined;
  highlightTone?: ValidationTone;
  markers: ValidationMarker[];
  markerTone?: ValidationTone;
  isMarkerOpen: boolean;
  onToggleMarker: () => void;
}) {
  const game = useGame();
  const {
    currentPlayer,
    getPlayerTileTint,
    isInteractionLocked,
    lastPlayedTileIds,
    playedTilesUsePlayerColors,
    returnTileToTray,
  } = game;
  const playedTileAnimationIds = game.playedTileAnimationIds ?? [];
  const playedTileAnimationSequence = game.playedTileAnimationSequence ?? 0;
  const { setNodeRef, isOver } = useDroppable({
    id: `board-${cell.row}-${cell.col}`,
    data: {
      target: "board",
      row: cell.row,
      col: cell.col,
    },
    disabled: isInteractionLocked,
  });

  const tile = draftTile?.tile ?? cell.tile;
  const isDraft = Boolean(draftTile);
  const playedTileAnimationIndex = tile
    ? playedTileAnimationIds.indexOf(tile.id)
    : -1;
  const tileOwnerId = draftTile ? currentPlayer.id : cell.tileOwnerId;
  const bonusVariant = cell.bonus || "none";
  const isLastPlayed =
    !isDraft && tile !== null && lastPlayedTileIds.includes(tile.id);
  const markerLabel =
    markerTone === "error"
      ? "!"
      : markerTone === "success"
        ? String(
            Math.max(
              ...markers
                .filter((marker) => marker.tone === "success")
                .map((marker) => marker.points ?? 0),
            ),
          )
        : null;

  return (
    <div
      ref={setNodeRef}
      className="relative p-0.5"
      data-board-cell={`${cell.row}-${cell.col}`}
    >
      <div
        className={boardCellVariants({
          bonus: bonusVariant,
          highlightTone,
          isOver,
        })}
      >
        {tile ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[118%] w-[118%]">
              <Tile
                key={
                  !isDraft && playedTileAnimationIndex >= 0
                    ? `played-${playedTileAnimationSequence}-${tile.id}`
                    : tile.id
                }
                tile={tile}
                size="board"
                tint={
                  playedTilesUsePlayerColors
                    ? getPlayerTileTint(tileOwnerId)
                    : "neutral"
                }
                dragData={
                  isDraft
                    ? {
                        source: "board",
                        tileId: tile.id,
                        row: cell.row,
                        col: cell.col,
                      }
                    : undefined
                }
                onClick={
                  isDraft
                    ? () => {
                        returnTileToTray(tile.id);
                      }
                    : undefined
                }
                disabled={isDraft ? isInteractionLocked : false}
                style={
                  !isDraft && playedTileAnimationIndex >= 0
                    ? ({
                        "--tile-anim-delay": `${playedTileAnimationIndex * 72}ms`,
                      } as CSSProperties)
                    : undefined
                }
                className={
                  [
                    !isDraft && playedTileAnimationIndex >= 0
                      ? "tile-play-in-jump"
                      : null,
                    !highlightTone && isLastPlayed ? "tile-last-played" : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              />
            </div>
          </div>
        ) : (
          cell.bonus
        )}
        {markerLabel ? (
          <>
            <button
              type="button"
              onClick={onToggleMarker}
              className={markerButtonVariants({ tone: markerTone })}
              aria-label={
                markerTone === "error" ? "Show word issue" : "Show word details"
              }
            >
              {markerLabel}
            </button>
            {isMarkerOpen ? (
              <div
                className={cn(
                  "absolute right-0 top-0 z-30 flex w-40 flex-col gap-1 translate-x-[18%] -translate-y-[calc(100%+0.35rem)] rounded-xl border p-2 text-left text-[0.6rem] font-medium shadow-[var(--shadow-brutal-sm)] sm:w-44 sm:text-[0.65rem]",
                  markerTone === "error"
                    ? "border-error-strong bg-error"
                    : "border-success-strong bg-success",
                )}
              >
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className={
                      marker.tone === "error"
                        ? "text-error-foreground"
                        : "text-success-foreground"
                    }
                  >
                    {marker.message}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
