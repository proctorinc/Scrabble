import { FC, ReactNode } from "react";
import AuthPage from "./AuthPage";
import { GameContextProvider } from "../context/GameContext";
import { BoardContextProvider } from "../context/BoardContext";
import { PlayerContextProvider } from "../context/PlayerContext";

type Props = {
  children: ReactNode;
};

const GameProviders: FC<Props> = ({ children }) => {
  return (
    <AuthPage>
      <GameContextProvider>
        <PlayerContextProvider>
          <BoardContextProvider>{children}</BoardContextProvider>
        </PlayerContextProvider>
      </GameContextProvider>
    </AuthPage>
  );
};

export default GameProviders;
