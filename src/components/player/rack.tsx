"use client";

import { useDroppable } from "@dnd-kit/core";
import { Tile } from "@/components/player/tile";
import { useGame } from "@/context/game-context";
import { cn } from "@/lib/utils";

function RackSlot({
  index,
  compact = false,
}: {
  index: number;
  compact?: boolean;
}) {
  const {
    isInteractionLocked,
    rackPlayer,
    shuffledRackTileIds,
    shuffledRackAnimationSequence,
  } = useGame();
  const tile = rackPlayer.rack[index] ?? null;
  const isShufflingTile = tile ? shuffledRackTileIds.includes(tile.id) : false;
  const { setNodeRef, isOver } = useDroppable({
    id: `rack-${index}`,
    data: {
      target: "rack",
      rackIndex: index,
    },
    disabled: isInteractionLocked,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex aspect-square items-center justify-center bg-rack-slot shadow-[var(--shadow-inset)]",
        compact ? "rounded-[12px]" : "rounded-2xl",
        isOver && "ring-2 ring-[color:var(--ring-strong)]",
      )}
    >
      {tile ? (
        <Tile
          key={
            isShufflingTile
              ? `shuffle-${shuffledRackAnimationSequence}-${tile.id}`
              : tile.id
          }
          tile={tile}
          dragData={{
            source: "rack",
            tileId: tile.id,
            rackIndex: index,
          }}
          disabled={isInteractionLocked}
          className={cn(
            isShufflingTile && "tile-shuffle-jump",
            compact ? "rounded-[10px]" : undefined,
          )}
        />
      ) : null}
    </div>
  );
}

export function Rack({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-7 justify-center gap-1 max-w-sm",
        compact
          ? "px-2 py-4"
          : "overflow-clip rounded-[24px] border-2 border-border bg-rack p-2 shadow-[var(--shadow-brutal-md)]",
      )}
    >
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={`rack-slot-${index}`}
          className={compact ? "" : "w-12 sm:w-14"}
        >
          <RackSlot index={index} compact={compact} />
        </div>
      ))}
    </div>
  );
}
