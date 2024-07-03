import { FC } from "react";
import { Cell, ItemTypes, Tile as TileType } from "../../types";
import { useDrop } from "react-dnd";
import useBoard from "../../hooks/useBoard";
import Tile from "../Tile";

type Props = {
  cell: Cell;
  row: number;
  col: number;
};

const Square: FC<Props> = ({ cell, row, col }) => {
  const { playTile, isTileOnCell } = useBoard();
  // const { changeTileOrder } = usePlayer();

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Tile,
    drop: (tile: TileType) => {
      // // Check if cell is the player's hand
      // if (cell.row === -1) {
      //   changeTileOrder(tile, cell.col);
      // } else
      if (!isTileOnCell(row, col)) {
        playTile(tile, row, col);
      }
      // if (tile.letter === "*") {

      // }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  if (cell.bonus === "DL") {
    return (
      <div
        ref={drop}
        className="p-1 flex items-center justify-center font-bold w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-lg"
      >
        <div className="text-white shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg bg-blue-400">
          {cell.tile === null ? cell.bonus : <Tile tile={cell.tile} />}
        </div>
      </div>
    );
  } else if (cell.bonus === "DW") {
    return (
      <div
        ref={drop}
        className="p-1 flex items-center justify-center font-bold w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-lg"
      >
        <div className="text-white shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg bg-red-400">
          {cell.tile === null ? cell.bonus : <Tile tile={cell.tile} />}
        </div>
      </div>
    );
  } else if (cell.bonus === "TL") {
    return (
      <div
        ref={drop}
        className="p-1 flex items-center justify-center font-bold w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-lg"
      >
        <div className="text-white shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg bg-purple-400">
          {cell.tile === null ? cell.bonus : <Tile tile={cell.tile} />}
        </div>
      </div>
    );
  } else if (cell.bonus === "TW") {
    return (
      <div
        ref={drop}
        className="p-1 flex items-center justify-center font-bold w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-lg"
      >
        <div className="text-white shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg bg-yellow-400">
          {cell.tile === null ? cell.bonus : <Tile tile={cell.tile} />}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={drop}
      className="p-1 flex items-center justify-center font-bold w-6 h-6 sm:w-10 sm:h-10 rounded-md sm:rounded-lg"
    >
      <div className="bg-gray-200 shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg">
        {cell.tile !== null && <Tile tile={cell.tile} />}
      </div>
    </div>
  );
};

export default Square;
