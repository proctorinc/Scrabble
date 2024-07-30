import {
  IconArrowsShuffle,
  IconCancel,
  IconMenu2,
  IconPlayerPlayFilled,
  IconReplace,
} from "@tabler/icons-react";
import usePlayer from "../../hooks/usePlayer";
import { CellContextProvider } from "../../context/CellContext";
import Cell from "../board/Cell";

const MobileActionBar = () => {
  const { currentPlayer } = usePlayer();

  return (
    <div id="bottom-bar" className="sm:hidden flex flex-grow">
      <div
        id="mobile-actionbar"
        className="flex flex-col w-full h-full bg-gray-100"
      >
        <div className="grid grid-cols-7 w-full justify-center items-center gap-1 py-5 px-1">
          {[...Array(7)].map((_, index) => {
            const tile =
              currentPlayer !== null && index <= currentPlayer.tiles.length - 1
                ? currentPlayer.tiles[index]
                : null;
            return (
              <div
                key={`player-tile-${index}`}
                className="aspect-square items-center justify-center border rounded-lg bg-gray-200 shadow-inner"
              >
                <CellContextProvider
                  key={tile !== null ? tile.id : `player-tiles-${index}`}
                  cell={{ tile, bonus: "", row: -1, col: -1 }}
                >
                  <Cell />
                </CellContextProvider>
              </div>
            );
          })}
          {/* {[...Array(7)].map((_, index) => {
            return (
              <div
                key={index}
                className="aspect-square items-center justify-center border rounded-lg bg-gray-200 shadow-inner"
              ></div>
            );
          })} */}
        </div>
        <div className="flex w-full flex-grow items-start px-5">
          <div className="flex items-center justify-between w-full">
            <button className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1">
              <IconCancel className="group-hover:text-white w-6 aspect-square" />
              Pass
            </button>
            <button className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1">
              <IconReplace className="group-hover:text-white w-6 aspect-square" />
              Swap
            </button>
            <button className="group hover:text-white hover:border-emerald-600 flex gap-0.5 bg-emerald-400 h-fit items-center hover:bg-emerald-600 rounded-lg px-4 py-1 text-lg border-2 border-emerald-700 text-emerald-700 font-bold shadow-md disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-500">
              Play
              <IconPlayerPlayFilled className="w-6 aspect-square" size={15} />
            </button>
            <button className="group flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1">
              <IconArrowsShuffle className="group-hover:text-white w-6" />
              Shuffle
            </button>
            <button className="group flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1">
              <IconMenu2 className="group-hover:text-white w-6" />
              Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileActionBar;
