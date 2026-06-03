"use client";

import { useDraggable } from "@dnd-kit/core";
import { cva, type VariantProps } from "class-variance-authority";
import type { CSSProperties } from "react";
import { Tile as TileType } from "@/types/game";
import { cn } from "@/lib/utils";
import { PlayerTint } from "@/lib/player-colors";

const tileVariants = cva(
  "relative flex aspect-square h-full w-full select-none items-center justify-center font-bold",
  {
    variants: {
      size: {
        rack: "rounded-[18px] border-2 text-[1.5rem] shadow-none",
        board: "rounded-[9px] border-2 text-[1rem] shadow-none",
      },
      tint: {
        neutral: "border-tile bg-tile text-tile",
        blue: "border-player-blue bg-badge-blue text-player-blue",
        rose: "border-player-rose bg-badge-rose text-player-rose",
        gold: "border-player-gold bg-badge-gold text-player-gold",
      },
    },
    defaultVariants: {
      size: "rack",
      tint: "neutral",
    },
  },
);

const tileValueVariants = cva("absolute font-semibold", {
  variants: {
    size: {
      rack: "bottom-0.5 right-1 text-[0.6rem] sm:bottom-1 sm:right-1.5 sm:text-[0.58rem]",
      board: "bottom-0 right-[3px] text-[0.6rem]",
    },
  },
  defaultVariants: {
    size: "rack",
  },
});

type TileProps = {
  tile: TileType;
  className?: string;
  style?: CSSProperties;
  dragData?: {
    source: "rack" | "board";
    tileId: string;
    rackIndex?: number;
    row?: number;
    col?: number;
  };
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  tint?: PlayerTint;
} & VariantProps<typeof tileVariants>;

export function Tile({
  tile,
  size = "rack",
  className,
  style: customStyle,
  dragData,
  selected = false,
  onClick,
  disabled = false,
  tint = "neutral",
}: TileProps) {
  const draggable = useDraggable({
    id: dragData ? `${dragData.source}-${tile.id}` : `static-${tile.id}`,
    data: dragData,
    disabled: !dragData || disabled,
  });

  const style = {
    ...customStyle,
    ...(dragData
      ? {
          opacity: draggable.isDragging ? 0 : 1,
          touchAction: "none",
        }
      : null),
  };
  const isInteractive = Boolean(dragData || onClick);
  const tileClassName = cn(
    tileVariants({ size, tint }),
    selected && "ring-2 ring-[color:var(--ring-strong)]",
    disabled && "opacity-60",
    className,
  );
  const tileContent = (
    <>
      <span>{tile.isBlank ? tile.letter || "" : tile.letter}</span>
      <span className={tileValueVariants({ size })}>
        {tile.isBlank ? "" : tile.value}
      </span>
    </>
  );

  if (!isInteractive) {
    return (
      <div style={style} className={tileClassName}>
        {tileContent}
      </div>
    );
  }

  return (
    <button
      ref={dragData ? draggable.setNodeRef : undefined}
      style={style}
      {...(dragData ? draggable.listeners : {})}
      {...(dragData ? draggable.attributes : {})}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={tileClassName}
    >
      {tileContent}
    </button>
  );
}
