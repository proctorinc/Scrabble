import Square from "./Square";
import useBoard from "../../hooks/useBoard";

const Board = () => {
  const { board } = useBoard();

  return (
    <>
      <div className="select-none flex flex-col rounded-lg bg-gray-100 p-1 sm:p-3 overflow-clip">
        {board.map((row, i) => (
          <div key={`board-row-${i}`} className="grid grid-cols-15">
            {row.map((cell, j) => (
              <Square key={`square-${i}-${j}`} cell={cell} row={i} col={j} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Board;
