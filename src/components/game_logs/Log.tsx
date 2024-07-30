import { FC, ReactNode } from "react";
import { GameLog, LogAction } from "../../types";
import usePlayer from "../../hooks/usePlayer";
import useGame from "../../hooks/useGame";

type Props = {
  log: GameLog;
};

type WrapperProps = {
  children: ReactNode;
};

const Log: FC<Props> = ({ log }) => {
  const { state } = useGame();
  const { currentPlayer } = usePlayer();

  const isCurrentPlayer = currentPlayer.id === log.player.id;

  const Wrapper: FC<WrapperProps> = ({ children }) => {
    if (isCurrentPlayer) {
      return (
        <div className="flex w-full justify-end gap-1 items-center">
          <div className="flex gap-1 bg-gray-200 shadow-inner rounded-md p-2 w-fit items-center">
            <span className="text-sm">{children}</span>
          </div>
          <span className="flex w-8 h-8 rounded-md items-center justify-center text-white font-semibold bg-gradient-to-tr from-blue-400 to-blue-300 shadow-inner">
            P1
          </span>
        </div>
      );
    }

    return (
      <div className="flex w-full gap-1 items-center">
        <span className="flex w-8 h-8 rounded-md items-center justify-center text-white font-semibold bg-gradient-to-tr from-red-400 to-red-300 shadow-inner">
          P2
        </span>
        <div className="flex gap-1 bg-gray-200 shadow-inner rounded-md p-2 w-fit items-center">
          <span className="text-sm">{children}</span>
        </div>
      </div>
    );
  };

  if (log.action === LogAction.JoinGame) {
    return (
      <Wrapper>
        <span className="text-right">Joined the game</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.PlayTiles) {
    return (
      <Wrapper>
        <span className="text-right">
          Played {log.word_played} for {log.points_scored} points
        </span>
      </Wrapper>
    );
  } else if (log.action === LogAction.QuitGame) {
    return (
      <Wrapper>
        <span className="text-right">Quit the game</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.SkipTurn) {
    return (
      <Wrapper>
        <span className="text-right">Passed</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.TradeTiles) {
    return (
      <Wrapper>
        <span className="text-right">Swapped {log.num_tiles_traded} tiles</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.WinGame) {
    return (
      <Wrapper>
        <span className="text-right">
          Won the game with {log.player.score} points
        </span>
      </Wrapper>
    );
  } else {
    console.error("Undefined log type found");
  }
};

export default Log;
