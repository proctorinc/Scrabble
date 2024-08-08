import { FC, ReactNode } from "react";
import { GameStatusMap, GameSummary } from "../../types";
import { useNavigate } from "react-router-dom";

type Props = {
  game: GameSummary;
};

type WrapperProps = {
  game: GameSummary;
  children: ReactNode;
};

const Wrapper: FC<WrapperProps> = ({ game, children }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/play/${game.id}`)}
      className="cursor-pointer text-sm bg-gray-100 rounded-lg flex items-center justify-between w-full p-4 hover:scale-105 hover:shadow-md hover:bg-gray-200"
    >
      {children}
    </div>
  );
};

const GameItem: FC<Props> = ({ game }) => {
  return (
    <Wrapper game={game}>
      {game.opponent !== null && (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-between">
            <h2>{game.is_local ? "Local" : "Online"}</h2>
            <h2>{GameStatusMap[game.status]}</h2>
          </div>
          <div className="flex gap-3 w-full justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-tr from-red-400 to-red-300 text-white font-semibold rounded-md px-2 py-1 whitespace-nowrap text-sm shadow-inner">
                {game.is_local
                  ? game.current_player.alias
                  : game.current_player.user.username}
              </span>
              <span>{game.current_player.score}</span>
            </div>
            <span>vs</span>
            <div className="flex items-center gap-3">
              <span>{game.opponent.score}</span>
              <span className="bg-gradient-to-tr from-blue-400 to-blue-300 text-white font-semibold rounded-md px-2 py-1 whitespace-nowrap text-sm shadow-inner">
                {game.is_local
                  ? game.opponent.alias
                  : game.opponent.user.username}
              </span>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default GameItem;
