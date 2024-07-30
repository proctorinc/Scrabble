import useBoard from "../../hooks/useBoard";
import { CellContextProvider } from "../../context/CellContext";
import Cell from "./Cell";

const Board = () => {
  const { board } = useBoard();

  return (
    <>
      <div className="aspect-square select-none flex flex-col rounded-lg bg-gray-100 p-1 sm:p-3">
        {board.map((row, i) => (
          <div key={`board-row-${i}`} className="grid grid-cols-15">
            {row.map((cell, j) => (
              <CellContextProvider cell={cell} key={`square-${i}-${j}`}>
                <Cell />
              </CellContextProvider>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Board;
