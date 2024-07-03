import { FC, ReactNode } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";

type Props = {
  children: ReactNode;
};

const Providers: FC<Props> = ({ children }) => {
  return (
    <Router>
      <AuthContextProvider>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </AuthContextProvider>
    </Router>
  );
};

export default Providers;
