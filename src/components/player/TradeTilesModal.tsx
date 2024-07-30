import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import { FC, useState } from "react";
import useGame from "../../hooks/useGame";
import { Tile as TileType } from "../../types";
import usePlayer from "../../hooks/usePlayer";
import Tile from "../Tile";

type Props = {
  open: boolean;
  onClose: () => void;
};

const TradeTilesModal: FC<Props> = ({ open, onClose }) => {
  const { state } = useGame();
  const { swapTiles } = usePlayer();

  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);

  const isTileSelected = selectedTiles.length > 0;

  function selectTile(tile: TileType) {
    if (!isSelected(tile)) {
      setSelectedTiles((prev) => {
        return [...prev, tile.id];
      });
    }
  }

  function removeSelectedTile(tile: TileType) {
    if (isSelected(tile)) {
      setSelectedTiles((prev) => {
        return prev.filter((id) => id !== tile.id);
      });
    }
  }

  function isSelected(tile: TileType) {
    return selectedTiles.includes(tile.id);
  }

  function confirmSwap() {
    if (isTileSelected) {
      swapTiles(selectedTiles).then(() => onClose());
    } else {
      console.error("At least one tile must be selected");
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
          <div className="flex gap-3 justify-center items-center rounded-lg bg-gray-100 p-2 overflow-clip">
            {state.current_player &&
              state.current_player.tiles.map((tile) => {
                if (isSelected(tile)) {
                  return (
                    <div
                      key={`selected-tile-${tile.id}`}
                      className="flex w-12 h-12 ring-4 ring-blue-400/50 rounded-lg"
                    >
                      <div
                        className="relative w-full h-full max-w-20 max-h-20 sm:p-4 select-none text-gray-700 aspect-square text-[0.9rem] sm:text-xl flex items-center justify-center font-bold shadow-md rounded-md sm:rounded-lg border sm:border-2 from-[#f5d074] to-[#f8e9c3] bg-gradient-to-tr border-[#d4ba76]"
                        onClick={() => removeSelectedTile(tile)}
                      >
                        <span>{tile.letter}</span>
                        <span className="font-normal absolute text-[0.33rem] sm:text-[0.5rem] bottom-0 right-[0px] sm:-bottom-2 sm:right-0.5">
                          {tile.value}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={`tile-${tile.id}`} className="flex w-12 h-12">
                      <div
                        className="relative w-full h-full max-w-20 max-h-20 sm:p-4 select-none text-gray-700 aspect-square text-[0.9rem] sm:text-xl flex items-center justify-center font-bold shadow-md rounded-md sm:rounded-lg border sm:border-2 from-[#f5d074] to-[#f8e9c3] bg-gradient-to-tr border-[#d4ba76]"
                        onClick={() => selectTile(tile)}
                      >
                        <span>{tile.letter}</span>
                        <span className="font-normal absolute text-[0.33rem] sm:text-[0.5rem] bottom-0 right-[0px] sm:-bottom-2 sm:right-0.5">
                          {tile.value}
                        </span>
                      </div>
                    </div>
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
