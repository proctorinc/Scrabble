import { FC } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes, Tile as TileType } from "../types";
import useBoard from "../hooks/useBoard";
import useCell from "../hooks/useCell";
import { IconX } from "@tabler/icons-react";

type Props = {
  tile: TileType;
  onClick?: () => void;
};

const Tile: FC<Props> = ({ tile, onClick }) => {
  const { showError, showScore } = useCell();
  const { returnTile, isTilePlayed, removeWildLetter, potentialPoints } =
    useBoard();
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.Tile,
      item: tile,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      canDrag: () => {
        return tile.in_play && onClick === undefined;
      },
    }),
    []
  );

  function returnTileToUser() {
    if (tile.in_play && isTilePlayed(tile)) {
      if (tile.is_wild) {
        removeWildLetter(tile.id);
        tile.letter = "";
      }
      returnTile(tile);
    }
  }

  return (
    <div
      ref={dragRef}
      style={{ opacity }}
      className={`relative w-full h-full max-w-20 max-h-20 sm:p-4 select-none text-gray-700 aspect-square text-[0.9rem] sm:text-xl flex items-center justify-center font-bold shadow-md rounded-md sm:rounded-lg border sm:border-2 ${
        tile.in_play
          ? "from-[#d5b86e] via-[#edcd7c] to-[#f3da9c] bg-gradient-to-tr border-[#b39c63] text-[#57503e] hover:scale-125 cursor-pointer"
          : "from-[#f5d074] to-[#f8e9c3] bg-gradient-to-tr border-[#d4ba76]"
      }`}
      onClick={onClick === undefined ? returnTileToUser : onClick}
    >
      <span>{tile.letter}</span>
      <span className="font-normal absolute text-[0.33rem] sm:text-[0.5rem] bottom-0 right-[0px] sm:-bottom-2 sm:right-0.5">
        {tile.value}
      </span>
      {showScore && (
        <div className="absolute -left-1.5 -top-1.5 flex justify-center items-center text-white text-xs rounded-full px-1 bg-emerald-400 shadow-sm">
          {potentialPoints}
        </div>
      )}
      {showError && (
        <div className="absolute -left-1.5 -top-1.5 flex justify-center items-center text-white rounded-full aspect-square w-4 bg-rose-400 shadow-sm">
          <IconX className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};

export default Tile;
