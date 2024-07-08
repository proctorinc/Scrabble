import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import { FC, useState } from "react";
import useGame from "../../hooks/useGame";
import { Tile } from "../../types";
import usePlayer from "../../hooks/usePlayer";

type Props = {
  open: boolean;
  onClose: () => void;
};

const TradeTilesModal: FC<Props> = ({ open, onClose }) => {
  const { state } = useGame();
  const { swapTiles } = usePlayer();

  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);

  const isTileSelected = selectedTiles.length > 0;

  function selectTile(tile: Tile) {
    if (!isSelected(tile)) {
      setSelectedTiles((prev) => {
        return [...prev, tile.id];
      });
    }
  }

  function removeSelectedTile(tile: Tile) {
    if (isSelected(tile)) {
      setSelectedTiles((prev) => {
        return prev.filter((id) => id !== tile.id);
      });
    }
  }

  function isSelected(tile: Tile) {
    return selectedTiles.includes(tile.id);
  }

  function confirmSwap() {
    if (isTileSelected) {
      swapTiles(selectedTiles);
    } else {
      console.log;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm">
        <DialogPanel className="max-w-lg w-full space-y-4 border bg-white p-5 rounded-xl shadow-xl">
          <DialogTitle className="font-bold flex justify-between items-center">
            Swap tiles
            <IconX className="w-5" onClick={onClose} />
          </DialogTitle>
          <div className="flex gap-2 justify-center items-center rounded-lg bg-gray-100 p-2 overflow-clip">
            {state.current_player &&
              state.current_player.tiles.map((tile) => {
                if (isSelected(tile)) {
                  return (
                    <button
                      key={`${tile.id}-selected`}
                      onClick={() => removeSelectedTile(tile)}
                    >
                      Selected: {tile.letter}
                    </button>
                  );
                } else {
                  return (
                    <button
                      key={`${tile.id}-unselected`}
                      onClick={() => selectTile(tile)}
                    >
                      {tile.letter}
                    </button>
                  );
                }
              })}
          </div>
          <div className="flex gap-4 w-full justify-center">
            <button onClick={onClose}>Cancel</button>
            <button disabled={!isTileSelected} onClick={confirmSwap}>
              Swap
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TradeTilesModal;
