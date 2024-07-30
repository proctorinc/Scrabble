import { FC, ReactNode } from "react";
import { DndProvider } from "react-dnd-multi-backend";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { GameHistoryContextProvider } from "../context/GameHistoryContext";

type Props = {
  children: ReactNode;
};

const Providers: FC<Props> = ({ children }) => {
  return (
    <Router>
      <AuthContextProvider>
        <GameHistoryContextProvider>
          <DndProvider options={HTML5toTouch}>{children}</DndProvider>
        </GameHistoryContextProvider>
      </AuthContextProvider>
    </Router>
  );
};

export default Providers;
