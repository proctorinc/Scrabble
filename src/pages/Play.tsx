import Board from "../components/board/Board";
import useGame from "../hooks/useGame";
import { GameStatus } from "../types";
import { IconCopy } from "@tabler/icons-react";
import { copyToClipboard } from "../utils";
import TabMenu from "../components/menu/TabMenu";
import TitleBar from "../components/title/TitleBar";
import MobileTitleBar from "../components/title/MobileTitleBar";
import ActionBar from "../components/action/ActionBar";
import MobileActionBar from "../components/action/MobileActionBar";
import useWebsocket from "../hooks/useWebsocket";

const Play = () => {
  const { state, isLoading, joinGameUrl } = useGame();
  const socket = useWebsocket();

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
    <div className="flex h-screen justify-center w-full">
      <div className="flex flex-col justify-center w-full max-w-2xl sm:p-3 lg:p-5 sm:gap-3 lg:pb-[36px] lg:gap-5">
        <MobileTitleBar />
        <Board />
        <ActionBar />
        <MobileActionBar />
      </div>
      <div
        id="right-sidebar"
        className="hidden lg:flex flex-col sm:gap-3 lg:gap-5 items-center max-w-3xl justify-center min-w-80"
      >
        <TitleBar />
        <TabMenu />
      </div>
    </div>
  );
};

export default Play;
