import { FC, useState } from "react";
import { ItemTypes, Tile as TileType } from "../../types";
import { useDrop } from "react-dnd";
import useBoard from "../../hooks/useBoard";
import Tile from "../Tile";
import useCell from "../../hooks/useCell";

const PlayerCell: FC = () => {
  const { cell } = useCell();
  const { returnTile } = useBoard();
  // const { changeTileOrder } = usePlayer();
  // const [wildLetter, setWildLetter] = useState("");

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Tile,
    drop: (tile: TileType) => {
      if (cell.tile === null) {
        if (tile.is_wild) {
          tile.letter = "";
        }
        console.log("DROPPING TILE, RETURNING!");
        returnTile(tile);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="relative p-0.5 sm:p-1 aspect-square flex items-center justify-center font-bold rounded-md sm:rounded-lg"
    >
      <div
        className={`text-[0.75rem] text-white shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg bg-gray-200`}
      >
        {cell.tile === null ? "" : <Tile tile={cell.tile} />}
      </div>
    </div>
  );
};

export default PlayerCell;
