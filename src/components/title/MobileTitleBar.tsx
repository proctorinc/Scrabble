import useGame from "../../hooks/useGame";
import usePlayer from "../../hooks/usePlayer";
import useUser from "../../hooks/useUser";

const MobileTitleBar = () => {
  const { state } = useGame();
  const currentUser = useUser();
  const { playerTurn, currentPlayer, players, isMyTurn } = usePlayer();

  return (
    <div
      id="mobile-top-bar"
      className="flex lg:hidden flex-col justify-end h-1/4 sm:h-fit w-full items-center pt-3"
    >
      {/* <div className="flex justify-center items-center h-1/2 sm:h-fit">
        Scrabble
      </div> */}
      <div className="relative flex flex-col h-1/2 sm:h-20 justify-center items-center w-full max-w-xl p-2">
        <div className="absolute left-3 flex flex-col items-center gap-1">
          <span className="text-3xl">{players[1].score}</span>
          <span className="bg-blue-200 rounded-md px-2 py-1 whitespace-nowrap text-sm">
            {state.is_local ? players[1].alias : players[1].user.username}
            {!state.is_local &&
              (players[1].user.id === currentUser.id ? " (you)" : "")}
          </span>
        </div>
        <div>
          <div>
            {state.is_local && isMyTurn && <div>{playerTurn.alias}'s turn</div>}
            {!state.is_local && isMyTurn && <div>Your turn</div>}
            {!state.is_local && !isMyTurn && (
              <div>{playerTurn.user.username}'s turn</div>
            )}
          </div>
        </div>
        <div className="absolute right-3 flex flex-col items-center gap-1">
          <span className="text-3xl">{currentPlayer.score}</span>
          <span className="bg-red-200 rounded-md px-2 py-1 whitespace-nowrap text-sm">
            {state.is_local
              ? players[0].alias
              : `${currentPlayer.user.username} (you)`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileTitleBar;
