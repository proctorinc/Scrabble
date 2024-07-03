import { FC, ReactNode, createContext, useState } from "react";
import { GamePlayer, Tile } from "../types";
import { shuffle } from "../utils";
import useGame from "../hooks/useGame";
import useUser from "../hooks/useUser";

type Props = {
  children: ReactNode;
};

type PlayerContext = {
  isMyTurn: boolean;
  currentPlayer: GamePlayer;
  playerTurn: GamePlayer;
  players: GamePlayer[];
  shuffleTiles: () => void;
  playTile: (tile: Tile) => void;
  returnTile: (tile: Tile) => void;
  returnTiles: (tiles: Tile[]) => void;
  changeTileOrder: (tileToMove: Tile, index: number) => void;
};

const PlayerContext = createContext<PlayerContext | null>(null);

export const PlayerContextProvider: FC<Props> = ({ children }) => {
  const { state } = useGame();
  const currentUser = useUser();

  const [players, setPlayers] = useState<GamePlayer[]>(state.players);
  const [playerTurn, setPlayerTurn] = useState<GamePlayer>(state.player_turn);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer>(
    state.current_player
  );

  const isMyTurn = currentUser.id === playerTurn.user.id;

  function shuffleTiles() {
    setCurrentPlayer((prev) => {
      return {
        user: prev.user,
        score: prev.score,
        tiles: shuffle<Tile>(prev.tiles),
      };
    });
  }

  function playTile(tile: Tile) {
    setCurrentPlayer((prev) => {
      return {
        user: prev.user,
        score: prev.score,
        tiles: prev.tiles.filter((aTile) => tile.id !== aTile.id),
      };
    });
  }

  function returnTile(tile: Tile) {
    setCurrentPlayer((prev) => {
      return {
        ...prev,
        tiles: [...prev.tiles, tile],
      };
    });
  }

  function returnTiles(tiles: Tile[]) {
    setCurrentPlayer((prev) => {
      return {
        ...prev,
        tiles: [...prev.tiles, ...tiles],
      };
    });
  }

  function changeTileOrder(tileToMove: Tile, index: number) {
    setCurrentPlayer((prev) => {
      // Get index of the tile
      const filteredTiles = prev.tiles.filter(
        (tile) => tile.id !== tileToMove.id
      );

      filteredTiles.splice(index - 1, 0, tileToMove);

      return {
        ...prev,
        tiles: filteredTiles,
      };
    });
  }

  const contextData = {
    isMyTurn,
    currentPlayer,
    playerTurn,
    players,
    shuffleTiles,
    playTile,
    returnTile,
    returnTiles,
    changeTileOrder,
  };

  return (
    <PlayerContext.Provider value={contextData}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
