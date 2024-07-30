import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { GameSummary } from "../types";

type Props = {
  children: ReactNode;
};

type GameHistoryContext = {
  games: GameSummary[];
  isLoading: boolean;
  error: string;
};

const GameHistoryContext = createContext<GameHistoryContext | null>(null);

export const GameHistoryContextProvider: FC<Props> = ({ children }) => {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGamesList();
  }, []);

  function fetchGamesList() {
    fetch("http://localhost:8080/v1/game", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.games) {
          setGames(data.games);
        }
      })
      .catch((err) => {
        setError(err);
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }

  const contextData = {
    games,
    isLoading,
    error,
  };

  return (
    <GameHistoryContext.Provider value={contextData}>
      {children}
    </GameHistoryContext.Provider>
  );
};

export default GameHistoryContext;
