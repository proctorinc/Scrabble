import Board from "../components/board/Board";
import useUser from "../hooks/useUser";
import useGame from "../hooks/useGame";
import Square from "../components/board/Square";
import usePlayer from "../hooks/usePlayer";
import useBoard from "../hooks/useBoard";
import { GameStatus } from "../types";
import {
  IconArrowBack,
  IconArrowsShuffle,
  IconBook2,
  IconCancel,
  IconCopy,
  IconPlayerPlayFilled,
  IconReplace,
  IconX,
} from "@tabler/icons-react";
import { copyToClipboard } from "../utils";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Tile from "../components/Tile";
import Logs from "../components/game_logs/Logs";

const Play = () => {
  const currentUser = useUser();
  const { state, isLoading, skipTurn, playTiles, joinGameUrl } = useGame();
  const { currentPlayer, playerTurn, players, isMyTurn, shuffleTiles } =
    usePlayer();
  const { returnAllPlayerTiles, isValidLetterPlacement, validCells } =
    useBoard();
  const [tradeInModalOpen, setTradeInModalOpen] = useState(false);

  if (isLoading) {
    return <></>;
  }

  if (state.status === GameStatus.INVITE_PLAYERS) {
    return (
      <div className="flex flex-col gap-10 w-full h-screen items-center justify-center overflow-y-scroll">
        <h1 className="text-3xl font-extralight">
          Waiting for another player to join...
        </h1>
        <div className="flex flex-col gap-2 w-full max-w-lg">
          <h3 className="text-sm pl-1">
            Share join URL with another player to join
          </h3>
          <div className="relative border border-gray-200 rounded-lg bg-gray-100">
            <input
              readOnly
              className="w-full bg-gray-100 p-2 rounded-lg text-sm text-gray-500"
              value={joinGameUrl}
            />
            <div className="flex items-center h-full justify-center absolute right-0 top-0 p-1">
              <button
                onClick={() => copyToClipboard(joinGameUrl)}
                className="group text-xs items-center hover:bg-gray-600 rounded-lg p-1"
              >
                <IconCopy className="group-hover:text-white w-6 aspect-square" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === GameStatus.COMPLETED) {
    return (
      <div className="flex flex-col gap-3 w-full h-screen items-center justify-center overflow-y-scroll">
        <p>Game has been completed!</p>
      </div>
    );
  }

  if (state.status === GameStatus.CANCELLED) {
    return (
      <div className="flex flex-col gap-3 w-full h-screen items-center justify-center overflow-y-scroll">
        <p>User has left the game. The game was quit.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-3 w-full h-screen items-center justify-center overflow-y-scroll p-3">
      <div className="w-fit absolute right-0 p-4 z-50 bg-gray-100 rounded-lg">
        <Logs />
      </div>
      <div className="relative flex flex-col justify-center items-center w-full max-w-xl h-20 p-2">
        <div className="absolute left-3 flex flex-col items-center">
          <span className="text-2xl">{players[0].score}</span>
          <span className="text-sm">
            {state.is_local ? players[0].alias : players[0].user.username}
            {!state.is_local &&
              (players[0].user.id === currentUser.id ? " (you)" : "")}
          </span>
        </div>
        <div>
          {state.is_local && isMyTurn && <div>{playerTurn.alias}'s turn</div>}
          {!state.is_local && isMyTurn && <div>Your turn</div>}
          {!state.is_local && !isMyTurn && (
            <div>{playerTurn.user.username}'s turn</div>
          )}
        </div>
        <div className="absolute right-3 flex flex-col items-center">
          <span className="text-2xl">{players[1].score}</span>
          <span className="text-sm">
            {state.is_local ? players[1].alias : players[1].user.username}
            {!state.is_local &&
              (players[1].user.id === currentUser.id ? " (you)" : "")}
          </span>
        </div>
      </div>
      <Board />
      <div className="relative flex gap-2 w-full max-w-lg justify-center">
        <div className="absolute flex gap-2 items-center h-full left-6">
          <button
            disabled={!isMyTurn}
            onClick={skipTurn}
            className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
          >
            <IconCancel className="group-hover:text-white w-6 aspect-square" />
          </button>
          <button
            disabled={!isMyTurn}
            onClick={() => setTradeInModalOpen(true)}
            className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
          >
            <IconReplace className="group-hover:text-white w-6 aspect-square" />
          </button>
        </div>
        <div className="flex gap-[2px] justify-center items-center rounded-lg bg-gray-100 p-2 overflow-clip">
          {[...Array(7)].map((_, index) => {
            const tile =
              currentPlayer !== null && index <= currentPlayer.tiles.length - 1
                ? currentPlayer.tiles[index]
                : null;
            return (
              <Square
                key={tile !== null ? tile.id : `player-tiles-${index}`}
                cell={{ tile, bonus: "", row: -1, col: -1 }}
                row={-1}
                col={index}
              />
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
          <button
            // onClick={}
            className="group h-fit flex flex-col text-xs items-center hover:bg-gray-600 rounded-lg p-1"
          >
            <IconBook2 className="group-hover:text-white w-6 aspect-square" />
          </button>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div>Tiles Left: {state.tile_bag.tiles.length}</div>
        {isMyTurn && (
          <button
            disabled={!isValidLetterPlacement}
            onClick={() => playTiles(validCells)}
            className="group hover:text-white hover:border-emerald-600 flex gap-0.5 bg-emerald-400 h-fit items-center hover:bg-emerald-600 rounded-lg px-4 py-1 text-lg border-2 border-emerald-700 text-emerald-700 font-bold shadow-md disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-500"
          >
            Play
            <IconPlayerPlayFilled className="w-6 aspect-square" size={15} />
          </button>
        )}
      </div>
      <Dialog
        open={tradeInModalOpen}
        onClose={() => setTradeInModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm">
          <DialogPanel className="max-w-lg w-full space-y-4 border bg-white p-5 rounded-xl shadow-xl">
            <DialogTitle className="font-bold flex justify-between items-center">
              Trade in tiles
              <IconX
                className="w-5"
                onClick={() => setTradeInModalOpen(false)}
              />
            </DialogTitle>
            <div className="flex gap-2 justify-center items-center rounded-lg bg-gray-100 p-2 overflow-clip">
              {state.current_player &&
                state.current_player.tiles.map((tile) => {
                  return <Tile key={tile.id} tile={tile} />;
                })}
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button onClick={() => setTradeInModalOpen(false)}>Cancel</button>
              <button onClick={() => console.log("trade in tiles")}>
                Trade
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default Play;
