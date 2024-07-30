import useGame from "../../hooks/useGame";
import usePlayer from "../../hooks/usePlayer";
import useUser from "../../hooks/useUser";

const TitleBar = () => {
  const currentUser = useUser();
  const { state } = useGame();
  const { currentPlayer, playerTurn, players, isMyTurn } = usePlayer();

  return (
    <div className="relative flex flex-col justify-center gap-5 items-center w-full h-fit p-3 bg-gray-100 rounded-lg">
      <div className="flex justify-between gap-5 w-full">
        <div className="flex flex-col items-start gap-1 w-1/2">
          <span className="text-3xl pl-2">{players[1].score}</span>
          <span className="bg-gradient-to-tr from-red-400 to-red-300 text-white font-semibold rounded-md px-2 py-1 whitespace-nowrap text-sm shadow-inner">
            {state.is_local ? players[1].alias : players[1].user.username}
            {!state.is_local &&
              (players[1].user.id === currentUser.id ? " (you)" : "")}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 w-1/2">
          <span className="text-3xl pr-2">{currentPlayer.score}</span>
          <span className="bg-gradient-to-tr from-blue-400 to-blue-300 text-white font-semibold rounded-md px-2 py-1 whitespace-nowrap text-sm shadow-inner">
            {state.is_local
              ? players[0].alias
              : `${currentPlayer.user.username} (you)`}
          </span>
        </div>
      </div>
      <div>
        {state.is_local && isMyTurn && <div>{playerTurn.alias}'s turn</div>}
        {!state.is_local && isMyTurn && <div>Your turn</div>}
        {!state.is_local && !isMyTurn && (
          <div>{playerTurn.user.username}'s turn</div>
        )}
      </div>
    </div>
  );
};

export default TitleBar;
