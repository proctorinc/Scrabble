"use client";

import { Tile } from "@/components/player/tile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGame } from "@/context/game-context";

export function TradeTilesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    currentPlayer,
    game,
    isInteractionLocked,
    selectTradeTile,
    clearTradeTiles,
    confirmTrade,
  } = useGame();

  if (!open || isInteractionLocked) {
    return null;
  }

  const disabled =
    game.draft.length > 0 ||
    game.selectedTradeTileIds.length === 0 ||
    game.bag.length < game.selectedTradeTileIds.length;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trade Tiles</DialogTitle>
          <DialogDescription>
            Pick tiles from the current rack to trade back into the bag.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-7 gap-2">
          {currentPlayer.rack.map((tile) => (
            <div key={tile.id} className="aspect-square">
              <Tile
                tile={tile}
                selected={game.selectedTradeTileIds.includes(tile.id)}
                onClick={() => selectTradeTile(tile.id)}
                disabled={isInteractionLocked}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearTradeTiles();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={disabled}
            onClick={() => {
              confirmTrade();
              onClose();
            }}
          >
            Trade Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
