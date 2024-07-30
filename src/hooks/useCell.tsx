import { useContext } from "react";
import CellContext from "../context/CellContext";

const useCell = () => {
  const cellContext = useContext(CellContext);

  if (!cellContext) {
    throw new Error("useCell has to be used within <CellContext.Provider>");
  }

  return cellContext;
};

export default useCell;
