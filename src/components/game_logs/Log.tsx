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
    return (
      <p className="flex gap-2 w-full justify-between items-center">
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {state.is_local && log.player.alias}
          {!state.is_local &&
            (isCurrentPlayer
              ? `${log.player.user.username} (you)`
              : log.player.user.username)}
        </span>
        {children}
      </p>
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
