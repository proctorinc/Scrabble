import { FC } from "react";
import { useDrag } from "react-dnd";
import { ItemTypes, Tile as TileType } from "../types";
import useBoard from "../hooks/useBoard";

type Props = {
  tile: TileType;
};

const Tile: FC<Props> = ({ tile }) => {
  const { returnTile, isTilePlayed } = useBoard();
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.Tile,
      item: tile,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      canDrag: () => {
        return tile.in_play;
      },
    }),
    []
  );
  return (
    <div
      ref={dragRef}
      style={{ opacity }}
      className="relative cursor-pointer select-none text-gray-700 aspect-square text-xl flex items-center justify-center font-bold shadow-xl w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg border-2 border-yellow-500 bg-yellow-400"
      onClick={() => {
        if (tile.in_play && isTilePlayed(tile)) {
          returnTile(tile);
        }
      }}
    >
      <span>{tile.letter !== "*" ? tile.letter : ""}</span>
      <span className="font-normal absolute text-xs bottom-0 right-0">
        {tile.value}
      </span>
    </div>
  );
};

export default Tile;
