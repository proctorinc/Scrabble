"use client";

import { Tile } from "@/components/player/tile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useGame } from "@/context/game-context";

export function TradeTilesDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    game,
    isInteractionLocked,
    rackPlayer,
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
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent className="sm:hidden">
        <DrawerHeader>
          <DrawerTitle>Trade Tiles</DrawerTitle>
          <DrawerDescription>
            Pick tiles from the current rack to trade back into the bag.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-7 gap-2 overflow-y-auto pb-1">
          {rackPlayer.rack.map((tile) => (
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
        <DrawerFooter>
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
