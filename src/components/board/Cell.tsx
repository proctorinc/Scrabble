import { FC, useState } from "react";
import { ItemTypes, Tile as TileType } from "../../types";
import { useDrop } from "react-dnd";
import useBoard from "../../hooks/useBoard";
import Tile from "../Tile";
import WildPickerModal from "../player/WildPickerModal";
import useCell from "../../hooks/useCell";

const Cell: FC = () => {
  const { cell } = useCell();
  const { playTile, isTileOnCell, setWildLetter, returnTile } = useBoard();
  // const { changeTileOrder } = usePlayer();
  const [wildModalOpen, setWildModalOpen] = useState(false);
  // const [wildLetter, setWildLetter] = useState("");

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Tile,
    drop: (tile: TileType) => {
      if (tile.is_wild) {
        tile.letter = "";
        playTile(tile, cell.row, cell.col);
        setWildModalOpen(true);
      } else if (!isTileOnCell(cell.row, cell.col)) {
        console.log("Playing tile...");
        playTile(tile, cell.row, cell.col);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  let backgroundColor = "bg-gray-200";

  if (cell.bonus === "DL") {
    backgroundColor =
      "bg-gradient-to-tr from-blue-400 to-blue-300 text-blue-50";
  } else if (cell.bonus === "DW") {
    backgroundColor = "bg-gradient-to-tr from-red-400 to-red-300 text-red-50";
  } else if (cell.bonus === "TL") {
    backgroundColor =
      "bg-gradient-to-tr from-purple-400 to-purple-300 text-purple-50";
  } else if (cell.bonus === "TW") {
    backgroundColor =
      "bg-gradient-to-tr from-yellow-400 to-yellow-300 text-yellow-50";
  }

  return (
    <>
      <div
        ref={drop}
        className="relative p-0.5 sm:p-1 aspect-square flex items-center justify-center font-bold rounded-md sm:rounded-lg"
      >
        <div
          className={`text-[0.75rem] text-white shadow-inner flex items-center justify-center font-bold w-full h-full rounded-md sm:rounded-lg ${backgroundColor}`}
        >
          {cell.tile === null ? cell.bonus : <Tile tile={cell.tile} />}
        </div>
      </div>
      <WildPickerModal
        open={wildModalOpen}
        onClose={() => {
          if (
            cell.tile !== null &&
            cell.tile.is_wild &&
            cell.tile.letter === ""
          ) {
            returnTile(cell.tile);
          }
          setWildModalOpen(false);
        }}
        onSelect={(letter) => {
          if (cell.tile) {
            setWildLetter(cell.tile.id, letter);
            cell.tile.letter = letter;
          } else {
            console.error("No tile on cell");
          }
        }}
      />
    </>
  );
};

export default Cell;
