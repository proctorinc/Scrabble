import { FC, ReactNode } from "react";
import AuthPage from "./AuthPage";
import { GameContextProvider } from "../context/GameContext";
import { BoardContextProvider } from "../context/BoardContext";
import { PlayerContextProvider } from "../context/PlayerContext";
import { ScoreAlertContextProvider } from "../context/ScoreAlertContexrt";

type Props = {
  children: ReactNode;
};

const GameProviders: FC<Props> = ({ children }) => {
  return (
    <AuthPage>
      <ScoreAlertContextProvider>
        <GameContextProvider>
          <PlayerContextProvider>
            <BoardContextProvider>{children}</BoardContextProvider>
          </PlayerContextProvider>
        </GameContextProvider>
      </ScoreAlertContextProvider>
    </AuthPage>
  );
};

export default GameProviders;
