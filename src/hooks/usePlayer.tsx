import { useContext } from "react";
import PlayerContext from "../context/PlayerContext";

const usePlayer = () => {
  const playerContext = useContext(PlayerContext);

  if (!playerContext) {
    throw new Error("usePlayer has to be used within <PlayerContext.Provider>");
  }

  return playerContext;
};

export default usePlayer;
