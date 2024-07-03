import { useContext } from "react";
import GameContext from "../context/GameContext";

const useGame = () => {
  const gameContext = useContext(GameContext);

  if (!gameContext) {
    throw new Error("useGame has to be used within <GameContext.Provider>");
  }

  return gameContext;
};

export default useGame;
