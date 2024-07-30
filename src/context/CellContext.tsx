import { FC, ReactNode, createContext, useState } from "react";
import { Cell } from "../types";
import useGame from "../hooks/useGame";
import useBoard from "../hooks/useBoard";

type Props = {
  cell: Cell;
  children: ReactNode;
};

type CellContext = {
  cell: Cell;
  showScore: boolean;
  showError: boolean;
};

const CellContext = createContext<CellContext | null>(null);

export const CellContextProvider: FC<Props> = ({ cell, children }) => {
  // const { state } = useGame();
  // const [cell, setCell] = useState<Cell>();
  const { isValidLetterPlacement, isValidDefinitions, playedWords } =
    useBoard();

  const showScore =
    isValidLetterPlacement &&
    isValidDefinitions &&
    playedWords[0].cells[0].col == cell.col &&
    playedWords[0].cells[0].row == cell.row;
  const showError =
    isValidLetterPlacement &&
    !isValidDefinitions &&
    playedWords[0].cells[0].col == cell.col &&
    playedWords[0].cells[0].row == cell.row;

  const contextData = {
    cell,
    showScore,
    showError,
  };

  return (
    <CellContext.Provider value={contextData}>{children}</CellContext.Provider>
  );
};

export default CellContext;
