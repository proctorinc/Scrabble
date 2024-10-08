import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { CellWithTile, GameMode, GameState, PlayTilesResponse } from "../types";
import { Link, useParams } from "react-router-dom";
import { socket } from "../websocket";
import useScoreAlert from "../hooks/useScoreAlert";

type Props = {
  children: ReactNode;
};

type GameContext = {
  gameId: string | undefined;
  state: GameState;
  mode: GameMode;
  isLoading: boolean;
  isGameLoaded: boolean;
  joinGameUrl: string;
  playTiles: (cells: CellWithTile[]) => void;
  quitGame: () => void;
  skipTurn: () => Promise<void>;
};

const GameContext = createContext<GameContext | null>(null);

export const GameContextProvider: FC<Props> = ({ children }) => {
  const { gameId } = useParams();
  const { alertScore } = useScoreAlert();
  const [state, setState] = useState<GameState>();
  const [games, setGames] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isGameLoaded = state !== undefined;
  const joinGameUrl = isGameLoaded
    ? `http://localhost:5173/join/${state.id}`
    : "";

  useEffect(() => {
    if (gameId !== undefined) {
      loadGame(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGamesList();
  }, []);

  function loadGame(gameId: string) {
    fetch(`http://localhost:8080/v1/game/${gameId}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setState(data.state))
      .then(() => setIsLoading(false));
  }

  function fetchGamesList() {
    fetch("http://localhost:8080/v1/game", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setGames(data.games));
  }

  function playTiles(cells: CellWithTile[]) {
    fetch(`http://localhost:8080/v1/game/${gameId}/turn/play`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cells: cells }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.state !== undefined) {
          console.log("Updated game state!");
          setState(data.state);
          if (data.points_scored > 0) {
            alertScore(data.points_scored);
          }
        } else {
          console.error("Failed to update game state");
        }
      });
  }

  function quitGame() {
    fetch(`http://localhost:8080/v1/game/${gameId}/quit`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.state !== undefined) {
          setState(data.state);
        }
      });
  }

  async function skipTurn() {
    return await fetch(`http://localhost:8080/v1/game/${gameId}/turn/skip`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.state !== undefined) {
          setState(data.state);
        }
      });
  }

  const LoadingScreen = () => {
    return (
      <div className="flex flex-col gap-3 w-full h-screen items-center justify-center overflow-y-scroll">
        <Link to="/">Loading Game...</Link>
      </div>
    );
  };

  const contextData = {
    gameId,
    state,
    mode: state?.is_local ? GameMode.Local : GameMode.Online,
    isLoading,
    isGameLoaded,
    joinGameUrl,
    skipTurn,
    quitGame,
    playTiles,
  };

  return (
    <GameContext.Provider value={contextData}>
      {isGameLoaded ? children : <LoadingScreen />}
    </GameContext.Provider>
  );
};

export default GameContext;
