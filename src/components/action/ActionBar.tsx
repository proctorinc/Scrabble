import {
  IconArrowBack,
  IconArrowsShuffle,
  IconCancel,
  IconMenu2,
  IconReplace,
} from "@tabler/icons-react";
import usePlayer from "../../hooks/usePlayer";
import useBoard from "../../hooks/useBoard";
import { useState } from "react";
import useGame from "../../hooks/useGame";
import TradeTilesModal from "../player/TradeTilesModal";
import SkipTurnModal from "../player/SkipTurnModal";
import { CellContextProvider } from "../../context/CellContext";
import PlayerCell from "../player/PlayerCell";

const ActionBar = () => {
  const { playTiles } = useGame();
  const { currentPlayer, isMyTurn, shuffleTiles } = usePlayer();
  const {
    returnAllPlayerTiles,
    isValidLetterPlacement,
    isValidDefinitions,
    playedCells,
  } = useBoard();
  const [tradeInModalOpen, setTradeInModalOpen] = useState(false);
  const [skipTurnModalOpen, setSkipTurnModalOpen] = useState(false);

  return (
    <div className="hidden sm:flex flex-col w-full justify-center items-center gap-3 lg:gap-5">
      <div className="relative hidden sm:flex w-full max-w-xl justify-center items-center">
        <div className="absolute flex gap-2 items-center h-full left-6">
          <button
            disabled={!isMyTurn}
            onClick={() => setSkipTurnModalOpen(true)}
            className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
          >
            <IconCancel className="group-hover:text-white w-6 aspect-square" />
          </button>
          <button
            onClick={() => setTradeInModalOpen(true)}
            className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
          >
            <IconReplace className="group-hover:text-white w-6 aspect-square" />
          </button>
        </div>
        <div className="flex justify-center items-center rounded-lg bg-gray-100 h-fit p-2 overflow-clip">
          {[...Array(7)].map((_, index) => {
            const tile =
              currentPlayer !== null && index <= currentPlayer.tiles.length - 1
                ? currentPlayer.tiles[index]
                : null;
            return (
              <div key={`player-tile-${index}`} className="w-12">
                <CellContextProvider
                  key={tile !== null ? tile.id : `player-tiles-${index}`}
                  cell={{ tile, bonus: "", row: -1, col: -1 }}
                >
                  <PlayerCell />
                </CellContextProvider>
              </div>
            );
          })}
        </div>
        <div className="absolute flex gap-2 items-center h-full right-6">
          {currentPlayer.tiles.length === 7 && (
            <button
              onClick={shuffleTiles}
              className="group flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
            >
              <IconArrowsShuffle className="group-hover:text-white w-6" />
            </button>
          )}
          {currentPlayer.tiles.length < 7 && (
            <button
              onClick={returnAllPlayerTiles}
              className="group flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
            >
              <IconArrowBack className="group-hover:text-white w-6 aspect-square" />
            </button>
          )}
          <button className="lg:invisible group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1">
            <IconMenu2 className="group-hover:text-white w-6 aspect-square" />
          </button>
        </div>
      </div>
      <button
        disabled={!isMyTurn || !isValidLetterPlacement || !isValidDefinitions}
        onClick={() => playTiles(playedCells)}
        className="group hover:text-white flex gap-0.5 h-fit items-center disabled:shadow-none rounded-lg px-8 py-2 text-2xl font-bold shadow-xl disabled:scale-75 hover:scale-110 text-white disabled:bg-gray-200 bg-yellow-300 disabled:text-gray-400"
      >
        Play
      </button>
      <TradeTilesModal
        open={tradeInModalOpen}
        onClose={() => setTradeInModalOpen(false)}
      />
      <SkipTurnModal
        open={skipTurnModalOpen}
        onClose={() => setSkipTurnModalOpen(false)}
      />
    </div>
  );
};

export default ActionBar;
