import { useContext } from "react";
import BoardContext from "../context/BoardContext";

const useBoard = () => {
  const boardContext = useContext(BoardContext);

  if (!boardContext) {
    throw new Error("useBoard has to be used within <BoardContext.Provider>");
  }

  return boardContext;
};

export default useBoard;
