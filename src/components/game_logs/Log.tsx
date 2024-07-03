import { FC, ReactNode } from "react";
import { GameLog, LogAction } from "../../types";
import usePlayer from "../../hooks/usePlayer";

type Props = {
  log: GameLog;
};

type WrapperProps = {
  children: ReactNode;
};

const Wrapper: FC<WrapperProps> = ({ children }) => {
  return (
    <p className="flex gap-2 w-full justify-between items-center">{children}</p>
  );
};

const Log: FC<Props> = ({ log }) => {
  const { currentPlayer } = usePlayer();

  const isCurrentPlayer = currentPlayer.id === log.player.id;

  console.log(currentPlayer.id, "==", log.player.id);

  if (log.action === LogAction.JoinGame) {
    return (
      <Wrapper>
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {isCurrentPlayer
            ? `${log.player.user.username} (you)`
            : log.player.user.username}
        </span>
        <span className="text-right">Joined the game</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.PlayTiles) {
    return (
      <Wrapper>
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {isCurrentPlayer
            ? `${log.player.user.username} (you)`
            : log.player.user.username}
        </span>
        <span className="text-right">
          Played {log.word_played} for {log.points_scored} points
        </span>
      </Wrapper>
    );
  } else if (log.action === LogAction.QuitGame) {
    return (
      <Wrapper>
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {isCurrentPlayer
            ? `${log.player.user.username} (you)`
            : log.player.user.username}
        </span>
        <span className="text-right">Quit the game</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.SkipTurn) {
    return (
      <Wrapper>
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {isCurrentPlayer
            ? `${log.player.user.username} (you)`
            : log.player.user.username}
        </span>
        <span className="text-right">Passed</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.TradeTiles) {
    return (
      <Wrapper>
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {isCurrentPlayer
            ? `${log.player.user.username} (you)`
            : log.player.user.username}
        </span>
        <span className="text-right">Swapped {log.num_tiles_traded} tiles</span>
      </Wrapper>
    );
  } else if (log.action === LogAction.WinGame) {
    return (
      <Wrapper>
        <span className="bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap">
          {isCurrentPlayer
            ? `${log.player.user.username} (you)`
            : log.player.user.username}
        </span>
        <span className="text-right">
          Won the game with {log.player.score} points
        </span>
      </Wrapper>
    );
  } else {
    return <Wrapper>ERROR: Undefined log type</Wrapper>;
  }
};

export default Log;
