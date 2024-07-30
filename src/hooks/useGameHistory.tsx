import { useContext } from "react";
import GameHistoryContext from "../context/GameHistoryContext";

const useGameHistory = () => {
  const gameHistoryContext = useContext(GameHistoryContext);

  if (!gameHistoryContext) {
    throw new Error(
      "useGameHistory has to be used within <GameHistoryContext.Provider>"
    );
  }

  return gameHistoryContext;
};

export default useGameHistory;
